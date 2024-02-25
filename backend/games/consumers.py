import time
import json
import asyncio
from django.db import transaction
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.utils import timezone
from django.contrib.auth import get_user_model
from websockets.exceptions import ConnectionClosedOK

from .models import Game
from tournaments.models import Tournament
from users.models import GameHistory

User = get_user_model()

BALL_SPEED = 10


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.update_task = None
        self.launcher = False
        self.game_state = {}

    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.user_id = self.scope["query_string"].decode("utf-8").split("=")[1]

        if self.user_id is not None:
            self.user_id = int(self.user_id)  # Convert user_id to int
            self.user = await self.get_user(self.user_id)
            if self.user:
                print(f"Connecting... game_id: {self.game_id}, user_id: {self.user_id}")
                self.game_group_name = f"game_{self.game_id}"
                await self.channel_layer.group_add(
                    self.game_group_name, self.channel_name
                )
                self.game = await sync_to_async(Game.objects.get)(id=self.game_id)
                # Check if the user is a player in the game
                if self.user_id not in [self.game.player1_id, self.game.player2_id]:
                    print("User is not a player in the game.")
                    await self.close()
                    return
                await self.accept()

                # Determine the player based on user_id and set ready flag
                if self.user_id == self.game.player1_id:
                    self.game.player1_ready = True
                elif self.user_id == self.game.player2_id:
                    self.game.player2_ready = True
                await sync_to_async(self.game.save)()

                if await self.ready_to_start_game():
                    await self.start_game()
            else:
                print("User not found.")
                await self.close()
        else:
            print("User ID not provided.")
            await self.close()

    async def disconnect(self, close_code):
        print(f"Disconnecting... game_id: {self.game_id}, user_id: {self.user_id}")
        self.game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if self.user_id is not None:
            if self.game and self.game.status != "completed":
                if self.user_id == self.game.player1_id:
                    winner_id = self.game.player2_id
                    loser_id = self.game.player1_id
                    self.game.player1_ready = False
                elif self.user_id == self.game.player2_id:
                    winner_id = self.game.player1_id
                    loser_id = self.game.player2_id
                    self.game.player2_ready = False
                else:
                    print("User is not a player in the game.")

                # Update scores: winner gets max score, loser gets  0
                if winner_id and loser_id:
                    self.game.player1_score, self.game.player2_score = (
                        (self.game.max_score, 0)
                        if winner_id == self.game.player1_id
                        else (0, self.game.max_score)
                    )
                    self.game.status = "completed"
                    await database_sync_to_async(self.game.save)()

                # Call end_game to finalize the game state and notify players
                if loser_id == self.user_id:
                    await self.end_game(self.game)

                if self.update_task:
                    print("Cancelling periodic update...")
                    self.update_task.cancel()
                    try:
                        await self.update_task
                    except asyncio.CancelledError:
                        pass

        await self.notify_status_change()
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def ready_to_start_game(self):
        game_ready = await self.check_game_ready()
        return game_ready

    @database_sync_to_async
    def check_game_ready(self):
        with transaction.atomic():
            game = Game.objects.select_for_update().get(id=self.game_id)
            return game.player1_ready and game.player2_ready

    async def start_game(self):
        self.launcher = True
        self.game = await sync_to_async(Game.objects.get)(id=self.game_id)

        print("Starting game...")

        if self.game.status == "empty" or self.game.status == "waiting":
            self.game.status = "in_progress"
            self.game.start_time = timezone.now()
            await sync_to_async(self.game.save)()

            self.game_state = {
                "player1_id": self.game.player1_id,
                "player2_id": self.game.player2_id,
                "player1_ready": self.game.player1_ready,
                "player2_ready": self.game.player2_ready,
                "pad1_x": self.game.win_width / 2,
                "pad1_y": self.game.win_height - 10,
                "pad2_x": self.game.win_width / 2,
                "pad2_y": 10,
                "ball_x": self.game.win_width / 2,
                "ball_y": self.game.win_height - 10 - 20,
                "player1_score": self.game.player1_score,
                "player2_score": self.game.player2_score,
                "player_turn": self.game.player1_id,
                "paused": self.game.paused,
                "ball_moving": self.game.ball_moving,
                "ball_velocity_x": self.game.ball_velocity_x,
                "ball_velocity_y": self.game.ball_velocity_y,
                "max_score": self.game.max_score,
                "win_width": self.game.win_width,
                "win_height": self.game.win_height,
                "ball_width": self.game.ball_width,
                "pad_width": self.game.pad_width,
                "pad_height": self.game.pad_height,
                "status": self.game.status,
            }

        await self.notify_players_game_started()

        # Start the periodic update task if this is player2 and the task isn't already running
        if self.update_task is None:
            print("Starting periodic update...")
            self.update_task = asyncio.create_task(self._periodic_update())

    async def _periodic_update(self):
        while self.game.status != "completed":
            start_time = time.time()
            await self.update_game_state()
            await self.send_game_state()
            end_time = time.time()
            elapsed_time = (end_time - start_time) * 1000
            sleep_time = max(32 - elapsed_time, 0)
            await asyncio.sleep(sleep_time / 1000)

    async def update_game_state(self):
        if self.game is None:
            return
        player1_id = self.game.player1_id
        player2_id = self.game.player2_id
        if player1_id is None or player2_id is None:
            return

        if not self.game_state["ball_moving"] and not self.game_state["paused"]:
            await self.check_turn()
            await self.send_game_state()
            return

        if self.game_state["ball_moving"] and not self.game_state["paused"]:
            self.game_state["ball_x"] += self.game_state["ball_velocity_x"]
            self.game_state["ball_y"] += self.game_state["ball_velocity_y"]
            await self.check_collisions(self.game)
            await self.check_score(self.game)

    async def send_game_state(self):
        if self.game_state["paused"] or self.game_state["status"] != "in_progress":
            return
        message = {
            "action": "game_state_update",
            "data": {
                "ball_x": self.game_state["ball_x"],
                "ball_y": self.game_state["ball_y"],
                "player1_score": self.game_state["player1_score"],
                "player2_score": self.game_state["player2_score"],
                "pad1_x": self.game_state["pad1_x"],
                "pad1_y": self.game_state["pad1_y"],
                "pad2_x": self.game_state["pad2_x"],
                "pad2_y": self.game_state["pad2_y"],
                "player_turn": self.game_state["player_turn"],
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def check_turn(self):
        PAD_WIDTH = self.game_state["pad_width"]
        BALL_SIZE = self.game_state["ball_width"]

        if self.game_state["player_turn"] == self.game_state["player1_id"]:
            self.game_state["ball_velocity_y"] = -BALL_SPEED
            # Adjust ball position relative to pad1
            if (
                self.game_state["ball_x"] - BALL_SIZE / 2
                < self.game_state["pad1_x"] - PAD_WIDTH / 2
            ):
                self.game_state["ball_x"] = (
                    self.game_state["pad1_x"] - PAD_WIDTH / 2 + BALL_SIZE / 2
                )
            elif (
                self.game_state["ball_x"] + BALL_SIZE / 2
                > self.game_state["pad1_x"] + PAD_WIDTH / 2
            ):
                self.game_state["ball_x"] = (
                    self.game_state["pad1_x"] + PAD_WIDTH / 2 - BALL_SIZE / 2
                )

            # Calculate ball velocity based on position relative to pad
            self.game_state["ball_velocity_x"] = (
                (self.game_state["ball_x"] - self.game_state["pad1_x"])
                / (PAD_WIDTH / 2)
            ) * BALL_SPEED
        elif self.game_state["player_turn"] == self.game_state["player2_id"]:
            self.game_state["ball_velocity_y"] = BALL_SPEED
            # Adjust ball position relative to pad2
            if (
                self.game_state["ball_x"] - BALL_SIZE / 2
                < self.game_state["pad2_x"] - PAD_WIDTH / 2
            ):
                self.game_state["ball_x"] = (
                    self.game_state["pad2_x"] - PAD_WIDTH / 2 + BALL_SIZE / 2
                )
            elif (
                self.game_state["ball_x"] + BALL_SIZE / 2
                > self.game_state["pad2_x"] + PAD_WIDTH / 2
            ):
                self.game_state["ball_x"] = (
                    self.game_state["pad2_x"] + PAD_WIDTH / 2 - BALL_SIZE / 2
                )

            # Calculate ball velocity based on position relative to pad
            self.game_state["ball_velocity_x"] = (
                (self.game_state["ball_x"] - self.game_state["pad2_x"])
                / (PAD_WIDTH / 2)
            ) * BALL_SPEED

    async def check_collisions(self, game):
        # Wall collision
        if (
            self.game_state["ball_x"] <= 1
            or self.game_state["ball_x"] + self.game_state["ball_width"] / 2
            >= self.game_state["win_width"] - 1
        ):
            self.game_state["ball_velocity_x"] = -self.game_state["ball_velocity_x"]

        # Pad 2 collision
        if (
            self.game_state["pad2_x"] - self.game_state["pad_width"] / 2
            < self.game_state["ball_x"]
            < self.game_state["pad2_x"] + self.game_state["pad_width"] / 2
        ):
            if (
                self.game_state["ball_y"]
                <= self.game_state["pad2_y"] + self.game_state["pad_height"] / 2 + 2
            ):
                if self.game_state["ball_velocity_y"] > -15:
                    self.game_state["ball_velocity_y"] -= 0.25
                self.game_state["ball_velocity_y"] = -self.game_state["ball_velocity_y"]
                self.game_state["ball_velocity_x"] = (
                    (self.game_state["ball_x"] - self.game_state["pad2_x"])
                    / (self.game_state["pad_width"] / 2)
                ) * BALL_SPEED

        # Pad 1 collision
        if (
            self.game_state["pad1_x"] - self.game_state["pad_width"] / 2
            < self.game_state["ball_x"]
            < self.game_state["pad1_x"] + self.game_state["pad_width"] / 2
        ):
            if (
                self.game_state["ball_y"]
                >= self.game_state["pad1_y"] - self.game_state["pad_height"] - 12
            ):
                self.game_state["ball_velocity_x"] = (
                    (self.game_state["ball_x"] - self.game_state["pad1_x"])
                    / (self.game_state["pad_width"] / 2)
                ) * BALL_SPEED
                if self.game_state["ball_velocity_y"] < 15:
                    self.game_state["ball_velocity_y"] += 0.25
                self.game_state["ball_velocity_y"] = -self.game_state["ball_velocity_y"]

    async def check_score(self, game):
        if (
            self.game_state["ball_y"] < 1
            or self.game_state["ball_y"] > self.game_state["win_height"] - 1
        ):
            self.game_state["ball_moving"] = False
            self.game_state["ball_velocity_x"] = 0

            if self.game_state["ball_y"] < 1:
                self.game_state["player1_score"] += 1
                self.game_state["player_turn"] = self.game_state["player2_id"]
                self.game_state["pad1_x"] = self.game_state["win_width"] / 2
                self.game_state["pad2_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_y"] = self.game_state["pad2_y"] + 20
                self.game_state["ball_velocity_y"] *= -1
            else:
                self.game_state["player2_score"] += 1
                self.game_state["player_turn"] = self.game_state["player1_id"]
                self.game_state["pad1_x"] = self.game_state["win_width"] / 2
                self.game_state["pad2_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_y"] = (
                    self.game_state["pad1_y"] - self.game_state["pad_height"] - 20
                )
                self.game_state["ball_velocity_y"] *= -1
            if (
                self.game_state["player1_score"] >= self.game_state["max_score"]
                or self.game_state["player2_score"] >= self.game_state["max_score"]
            ):
                self.game_state["status"] = "completed"
                await self.sync_game_state_to_db()
                await self.end_game(game)
            await self.sync_game_state_to_db()

    async def game_message(self, event):
        message = event["message"]
        try:
            await self.send(text_data=json.dumps(message))
        except ConnectionClosedOK:
            print("Attempted to send a message to a closed WebSocket connection.")

    # async def leave_game(self, event):
    #     if not self.launcher:
    #         return
    #     print("Leaving game...")
    #     game_id = event["game_id"]
    #     winner_id = event["winner_id"]
    #     loser_id = event["loser_id"]

    #     game = await database_sync_to_async(Game.objects.get)(id=game_id)
    #     winner = await database_sync_to_async(User.objects.get)(id=winner_id)
    #     loser = await database_sync_to_async(User.objects.get)(id=loser_id)

    #     game.winner = winner
    #     game.loser = loser
    #     game.status = "completed"

    #     # Increment wins and losses
    #     winner.wins += 1
    #     loser.losses += 1

    #     # Save the changes
    #     await database_sync_to_async(winner.save)()
    #     await database_sync_to_async(loser.save)()
    #     await database_sync_to_async(game.save)()

    #     await self.create_game_history(game)

    #     game = await database_sync_to_async(Game.objects.get)(id=game_id)
    #     if game.tournament_id is not None:
    #         tournament = await database_sync_to_async(Tournament.objects.get)(
    #             id=game.tournament_id
    #         )
    #         await tournament.game_ended(game.winner)

    #     message = {
    #         "action": "leave_game",
    #         "data": {
    #             "message": "A player has left the game. The game has ended.",
    #             "winner_id": winner_id,
    #             "loser_id": loser_id,
    #         },
    #     }
    #     await self.channel_layer.group_send(
    #         self.game_group_name,
    #         {
    #             "type": "game_message",
    #             "message": message,
    #         },
    #     )

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    async def end_game(self, game):
        print("Ending game...")
        game.status = "completed"
        game.winner = await self.determine_winner(game.id)
        game.loser = await self.determine_loser(game.id)
        print("Winner:", game.winner)
        print("Loser:", game.loser)
        game.end_time = timezone.now()
        await sync_to_async(game.save)()

        game.winner.wins += 1
        game.loser.losses += 1
        await sync_to_async(game.winner.save)()
        await sync_to_async(game.loser.save)()

        await self.create_game_history(game)

        message = {
            "action": "end_game",
            "data": {
                "message": "The game has ended.",
                "winner_id": game.winner.id if game.winner else None,
                "loser_id": game.loser.id if game.loser else None,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

        if game.tournament_id is not None:
            tournament = await database_sync_to_async(Tournament.objects.get)(
                id=game.tournament_id
            )
            await tournament.game_ended(game.winner)

    async def determine_winner(self, game_id):
        game = await database_sync_to_async(Game.objects.get)(id=game_id)

        # Fetch player1 and player2 asynchronously
        player1 = await database_sync_to_async(lambda: game.player1)()
        player2 = await database_sync_to_async(lambda: game.player2)()

        if game.player1_score >= game.player2_score:
            return player1
        elif game.player2_score >= game.player1_score:
            return player2

    async def determine_loser(self, game_id):
        game = await database_sync_to_async(Game.objects.get)(id=game_id)

        # Fetch player1 and player2 asynchronously
        player1 = await database_sync_to_async(lambda: game.player1)()
        player2 = await database_sync_to_async(lambda: game.player2)()

        if game.player1_score >= game.player2_score:
            return player2
        elif game.player2_score >= game.player1_score:
            return player1

    async def create_game_history(self, game):
        player1 = await database_sync_to_async(lambda: game.player1)()
        player2 = await database_sync_to_async(lambda: game.player2)()
        winner = await database_sync_to_async(lambda: game.winner)()

        game_history = GameHistory(
            player1=player1,
            player2=player2,
            player1_score=game.player1_score,
            player2_score=game.player2_score,
            winner=winner,
            played_at=game.end_time,
        )
        await database_sync_to_async(game_history.save)()

    async def sync_game_state_to_db(self):
        if self.game is None:
            return

        self.game.pad1_x = self.game_state["pad1_x"]
        self.game.pad1_y = self.game_state["pad1_y"]
        self.game.pad2_x = self.game_state["pad2_x"]
        self.game.pad2_y = self.game_state["pad2_y"]
        self.game.ball_x = self.game_state["ball_x"]
        self.game.ball_y = self.game_state["ball_y"]
        self.game.ball_velocity_x = self.game_state["ball_velocity_x"]
        self.game.ball_velocity_y = self.game_state["ball_velocity_y"]
        self.game.player1_score = self.game_state["player1_score"]
        self.game.player2_score = self.game_state["player2_score"]
        self.game.player_turn = self.game_state["player_turn"]
        self.game.paused = self.game_state["paused"]
        self.game.ball_moving = self.game_state["ball_moving"]

        await sync_to_async(self.game.save)()

    async def key_action(self, event):
        if not self.launcher:
            return
        player_id = event["player_id"]
        action = event["action"]

        if action == "pause":
            self.game_state["paused"] = True
        elif action == "resume":
            self.game_state["paused"] = False

        if self.game_state.get("paused", False):
            return

        # Determine which pad to move based on the player_id
        pad_key = (
            "pad1_x"
            if player_id == self.game_state.get("player1_id", None)
            else "pad2_x"
        )

        # Update the game state based on the action
        if action == "move_right":
            self.game_state[pad_key] = min(
                self.game_state.get(pad_key, 0) + 10,
                self.game_state.get("win_width", 426)
                - self.game_state.get("pad_width", 100) / 2,
            )
        elif action == "move_left":
            self.game_state[pad_key] = max(
                self.game_state.get(pad_key, 0) - 10,
                self.game_state.get("pad_width", 100) / 2,
            )
        elif action == "launch_ball" and player_id == self.game_state.get(
            "player_turn", None
        ):
            self.game_state["ball_moving"] = True

    async def notify_status_change(self):
        message = {
            "action": "update_status",
            "data": {
                "status": self.game.status,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def notify_players_game_started(self):
        message = {
            "action": "start_game",
            "data": {
                "message": "Game has started",
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def handle_leave_game(self, user_id):
        user = await database_sync_to_async(User.objects.get)(id=user_id)
        if user not in [self.game.player1, self.game.player2]:
            return {"error": "You are not a player in this game"}, 403

        if user == self.game.player1:
            winner = self.game.player2
            loser = self.game.player1
        else:
            winner = self.game.player1
            loser = self.game.player2

        self.game.status = "completed"
        self.game.winner = winner
        self.game.loser = loser
        self.game.end_time = timezone.now()
        await database_sync_to_async(self.game.save)()

        self.game_state["status"] = "completed"

        await self.notify_players_game_ended(winner.id, loser.id)

    async def notify_players_game_ended(self, winner_id, loser_id):
        message = {
            "type": "leave_game",
            "message": "A player has left the game. The game has ended.",
            "winner_id": winner_id,
            "loser_id": loser_id,
            "game_id": self.game_id,
        }
        await self.channel_layer.group_send(self.game_group_name, message)

    async def game_leave(self, event):
        user_id = event["user_id"]
        game = await database_sync_to_async(Game.objects.get)(id=self.game_id)

        # Determine the winner and loser based on who is leaving
        if game.player1_id == user_id:
            winner_id = game.player2_id
            loser_id = game.player1_id
        elif game.player2_id == user_id:
            winner_id = game.player1_id
            loser_id = game.player2_id
        else:
            # Handle error if user is not part of the game
            return

        # Update scores: winner gets max score, loser gets 0
        if winner_id and loser_id:
            game.player1_score, game.player2_score = (
                (game.max_score, 0)
                if winner_id == game.player1_id
                else (0, game.max_score)
            )
            game.status = "completed"
            await database_sync_to_async(game.save)()

            # Call end_game to finalize the game state and notify players
            await self.end_game(game)
