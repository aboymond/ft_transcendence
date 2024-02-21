import time
import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.utils import timezone
from django.contrib.auth import get_user_model
from websockets.exceptions import ConnectionClosedOK

from .models import Game
from .utils import handle_leave_game
from tournaments.models import Tournament
from users.models import GameHistory

User = get_user_model()

BALL_SPEED = 10

class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.update_task = None
        self.game_state = {
            "player1_id": None,
            "player2_id": None,
            "player1_ready": False,
            "player2_ready": False,
            "pad1_x": 0,
            "pad1_y": 0,
            "pad2_x": 0,
            "pad2_y": 0,
            "ball_x": 0,
            "ball_y": 0,
            "player1_score": 0,
            "player2_score": 0,
            "player_turn": 0,
            "paused": False,
            "ball_moving": False,
            "ball_velocity_x": 0,
            "ball_velocity_y": 0,
            "max_score": 5,
            "win_width": 426,
            "win_height": 563,
            "ball_width": 10,
            "pad_width": 100,
            "pad_height": 10,
            "status": "in_progress",
            "key_released": False,
            "key_pressed": False,
        }

    async def connect(self):
        print("Connecting... (Game)")
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

        if await self.ready_to_start_game():
            await self.start_game()

    async def disconnect(self, close_code):
        print("Disconnecting... (Game)")
        self.game_state["status"] = "completed"
        await self.sync_game_state_to_db()
        if self.update_task:
            print("Cancelling periodic update...")
            self.update_task.cancel()
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def ready_to_start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        player1 = await sync_to_async(getattr)(game, "player1_ready", False)
        player2 = await sync_to_async(getattr)(game, "player2_ready", False)
        return player1 and player2

    async def start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if game is None:
            return
        game.start_time = timezone.now()
        game.status = "in_progress"
        await sync_to_async(game.save)()
        self.game_state = {
            "player1_id": game.player1_id,
            "player2_id": game.player2_id,
            "player1_ready": game.player1_ready,
            "player2_ready": game.player2_ready,
            "pad1_x": game.win_width / 2,
            "pad1_y": game.win_height - 10,
            "pad2_x": game.win_width / 2,
            "pad2_y": 10,
            "ball_x": game.win_width / 2,
            "ball_y": game.win_height - 10 - 20,
            "player1_score": game.player1_score,
            "player2_score": game.player2_score,
            "player_turn": game.player1_id if game.player1_ready else game.player2_id,
            "paused": game.paused,
            "ball_moving": game.ball_moving,
            "ball_velocity_x": game.ball_velocity_x,
            "ball_velocity_y": game.ball_velocity_y,
            "max_score": game.max_score,
            "win_width": game.win_width,
            "win_height": game.win_height,
            "ball_width": game.ball_width,
            "pad_width": game.pad_width,
            "pad_height": game.pad_height,
            "status": game.status,
        }

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
        print("Starting periodic update...")
        self.update_task = asyncio.create_task(self._periodic_update())

    async def _periodic_update(self):
        while True:
            start_time = time.time()
            await self.update_game_state()
            await self.send_game_state()
            end_time = time.time()
            elapsed_time = (end_time - start_time) * 1000
            sleep_time = max(32 - elapsed_time, 0)
            await asyncio.sleep(sleep_time / 1000)

    async def update_game_state(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if game is not None:
            player1_id = game.player1_id
            player2_id = game.player2_id
            if player1_id is None or player2_id is None:
                return

        if not self.game_state["ball_moving"] and not self.game_state["paused"]:
            await self.check_turn()
            await self.send_game_state()
            return

        if self.game_state["ball_moving"] and not self.game_state["paused"]:
            self.game_state["ball_x"] += self.game_state["ball_velocity_x"]
            self.game_state["ball_y"] += self.game_state["ball_velocity_y"]
            await self.check_collisions(game)
            await self.check_score(game)

        await sync_to_async(game.save)()

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
        player1_id = self.game_state["player1_id"]
        player2_id = self.game_state["player2_id"]

        PAD_WIDTH = self.game_state["pad_width"]
        BALL_SIZE = self.game_state["ball_width"]


        if self.game_state["player_turn"] == player1_id:
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
            ) * 10
        elif self.game_state["player_turn"] == player2_id:
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
            ) * 10

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
                ) * 10

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
                ) * 10
                if self.game_state["ball_velocity_y"] < 15:
                    self.game_state["ball_velocity_y"] += 0.25
                self.game_state["ball_velocity_y"] = -self.game_state["ball_velocity_y"]

    async def check_score(self, game):
        player1_id = self.game_state["player1_id"]
        player2_id = self.game_state["player2_id"]

        if (
            self.game_state["ball_y"] < 1
            or self.game_state["ball_y"] > self.game_state["win_height"] - 1
        ):
            self.game_state["ball_moving"] = False
            self.game_state["ball_velocity_x"] = 0

            if self.game_state["ball_y"] < 1:
                self.game_state["player1_score"] += 1
                self.game_state["player_turn"] = player2_id
                self.game_state["pad1_x"] = self.game_state["win_width"] / 2
                self.game_state["pad2_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_y"] = self.game_state["pad2_y"] + 20
                self.game_state["ball_velocity_y"] *= -1
            else:
                self.game_state["player2_score"] += 1
                self.game_state["player_turn"] = player1_id
                self.game_state["pad1_x"] = self.game_state["win_width"] / 2
                self.game_state["pad2_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_x"] = self.game_state["win_width"] / 2
                self.game_state["ball_y"] = self.game_state["pad1_y"] - self.game_state["pad_height"] - 20
                self.game_state["ball_velocity_y"] *= -1
            if (
                self.game_state["player1_score"] >= self.game_state["max_score"]
                or self.game_state["player2_score"] >= self.game_state["max_score"]
            ):
                self.game_state["status"] = "completed"
                await self.sync_game_state_to_db()
                await self.end_game(game)

    async def game_message(self, event):
        message = event["message"]
        try:
            await self.send(text_data=json.dumps(message))
        except ConnectionClosedOK:
            print("Attempted to send a message to a closed WebSocket connection.")

    async def leave_game(self, event):
        await self.sync_game_state_to_db()
        winner_id = event["winner_id"]
        loser_id = event["loser_id"]
        game_id = event["game_id"]

        winner = await database_sync_to_async(User.objects.get)(id=winner_id)
        loser = await database_sync_to_async(User.objects.get)(id=loser_id)
        winner.wins += 1
        await database_sync_to_async(winner.save)()
        loser.losses += 1
        await database_sync_to_async(loser.save)()

        game = await database_sync_to_async(Game.objects.get)(id=game_id)
        if game.tournament_id is not None:
            tournament = await database_sync_to_async(Tournament.objects.get)(
                id=game.tournament_id
            )
            # winner = [game.winner]
            print("Winner:", winner)
            round_number = await database_sync_to_async(
                Tournament.get_next_round_number
            )(tournament)
            print("Round number:", round_number)
            await database_sync_to_async(Tournament.create_matches_for_round)(
                tournament, [winner], round_number
            )

        message = {
            "action": "leave_game",
            "data": {
                "message": "A player has left the game. The game has ended.",
                "winner_id": winner_id,
                "loser_id": loser_id,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def user_disconnected(self, event):
        user_id = event["user_id"]
        user = await self.get_user(user_id)
        await database_sync_to_async(handle_leave_game)(self.game_id, user)

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    async def end_game(self, game):
        game.status = "completed"
        game.winner = await sync_to_async(self.determine_winner)(game)
        game.loser = await sync_to_async(self.determine_loser)(game)
        game.end_time = timezone.now()
        await sync_to_async(game.save)()

        game.winner.wins += 1
        await sync_to_async(game.winner.save)()
        game.loser.losses += 1
        await sync_to_async(game.loser.save)()

        if game.tournament_id is not None:
            tournament = await database_sync_to_async(Tournament.objects.get)(
                id=game.tournament_id
            )
            winner = [game.winner]
            print("Winner:", winner)
            round_number = await database_sync_to_async(
                Tournament.get_next_round_number
            )(tournament)
            print("Round number:", round_number)
            await database_sync_to_async(Tournament.create_matches_for_round)(
                tournament, [winner], round_number
            )

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
        await self.sync_game_state_to_db()
        await self.create_game_history(game)

    def determine_winner(self, game):
        return (
            game.player1
            if self.game_state["player1_score"] >= self.game_state["max_score"]
            else game.player2
        )

    def determine_loser(self, game):
        return (
            game.player2
            if self.game_state["player1_score"] >= self.game_state["max_score"]
            else game.player1
        )

    async def create_game_history(self, game):
        print("Creating game history...")
        print("player1_score:", self.game_state["player1_score"])
        print("player2_score:", self.game_state["player2_score"])
        game_history = GameHistory(
            winner=game.winner,
            player1_score=self.game_state["player1_score"],
            player2_score=self.game_state["player2_score"],
        )
        game_history.save()
        game_history.players.add(game.player1, game.player2)

    async def sync_game_state_to_db(self):
        game = await database_sync_to_async(Game.objects.get)(id=self.game_id)
        game.pad1_x = self.game_state["pad1_x"]
        game.pad1_y = self.game_state["pad1_y"]
        game.pad2_x = self.game_state["pad2_x"]
        game.pad2_y = self.game_state["pad2_y"]
        game.ball_x = self.game_state["ball_x"]
        game.ball_y = self.game_state["ball_y"]
        game.ball_velocity_x = self.game_state["ball_velocity_x"]
        game.ball_velocity_y = self.game_state["ball_velocity_y"]
        game.player1_score = self.game_state["player1_score"]
        game.player2_score = self.game_state["player2_score"]
        game.player_turn = self.game_state["player_turn"]
        game.paused = self.game_state["paused"]
        game.ball_moving = self.game_state["ball_moving"]
        await database_sync_to_async(game.save)()

    async def game_state_update(self, event):
        message = event["message"]
        self.game_state.update(message)

    async def key_action(self, event):
        player_id = event["player_id"]
        action = event["action"]

        # Determine which pad to move based on the player_id
        pad_key = "pad1_x" if player_id == self.game_state["player1_id"] else "pad2_x"

        # Update the game state based on the action
        if action == "move_right":
            self.game_state[pad_key] = min(
                self.game_state[pad_key] + 10,
                self.game_state["win_width"] - self.game_state["pad_width"] / 2,
            )
        elif action == "move_left":
            self.game_state[pad_key] = max(
                self.game_state[pad_key] - 10, self.game_state["pad_width"] / 2
            )
        elif action == "launch_ball" and player_id == self.game_state["player_turn"]:
            self.game_state["ball_moving"] = True
        elif action == "pause":
            self.game_state["paused"] = True
        elif action == "resume":
            self.game_state["paused"] = False
