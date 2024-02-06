from django.db import models
from django.conf import settings
from users.models import GameHistory
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
import operator


class Game(models.Model):
    STATUS_CHOICES = [
        ("waiting", "Waiting for Player"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    PLAYER_TURN_CHOICES = [
        (1, "Player 1"),
        (2, "Player 2"),
    ]

    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player1",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    max_score = models.IntegerField(default=5)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="waiting")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    group_name = models.CharField(max_length=255, null=True, blank=True)

    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    loser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_lost",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    # GameState
    ball_x = models.FloatField(default=0)
    ball_y = models.FloatField(default=0)
    ball_velocity_x = models.FloatField(default=0)
    ball_velocity_y = models.FloatField(default=0)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    pad1_x = models.FloatField(default=0)
    pad1_y = models.FloatField(default=0)
    pad2_x = models.FloatField(default=0)
    pad2_y = models.FloatField(default=0)
    player_turn = models.PositiveSmallIntegerField(
        choices=PLAYER_TURN_CHOICES, default=1
    )

    pad_width = models.FloatField(default=0)
    pad_height = models.FloatField(default=0)
    width = models.FloatField(default=600)
    height = models.FloatField(default=800)

    def update_ball_position(self):
        self.ball_x += self.ball_velocity_x
        self.ball_y += self.ball_velocity_y
        self.check_collisions()
        self.save()

    def move_pad(self, pad_number, new_x):
        if pad_number == 1:
            if new_x < self.pad_width / 2:
                self.pad1_x = self.pad_width / 2
            elif new_x > self.width - self.pad_width / 2:
                self.pad1_x = self.width - self.pad_width / 2
            else:
                self.pad1_x = new_x
        elif pad_number == 2:
            if new_x < self.pad_width / 2:
                self.pad2_x = self.pad_width / 2
            elif new_x > self.width - self.pad_width / 2:
                self.pad2_x = self.width - self.pad_width / 2
            else:
                self.pad2_x = new_x
        self.save()

    def check_collisions(self):
        # If the ball hits the left or right wall, reverse the x velocity
        if self.ball_x <= 0 or self.ball_x >= self.width:
            self.ball_velocity_x *= -1

        # If the ball hits the top or bottom wall, reverse the y velocity
        if self.ball_y <= 0 or self.ball_y >= self.height:
            self.ball_velocity_y *= -1

        # If the ball hits player1's pad, reverse the y velocity and adjust the x velocity
        if (
            self.ball_y <= self.pad1_y + self.pad_height
            and self.pad1_x - self.pad_width / 2
            <= self.ball_x
            <= self.pad1_x + self.pad_width / 2
        ):
            self.ball_velocity_y *= -1
            self.ball_velocity_x = (
                (self.ball_x - self.pad1_x) / (self.pad_width / 2)
            ) * 5

        # If the ball hits player2's pad, reverse the y velocity and adjust the x velocity
        if (
            self.ball_y >= self.pad2_y - self.pad_height
            and self.pad2_x - self.pad_width / 2
            <= self.ball_x
            <= self.pad2_x + self.pad_width / 2
        ):
            self.ball_velocity_y *= -1
            self.ball_velocity_x = (
                (self.ball_x - self.pad2_x) / (self.pad_width / 2)
            ) * 5
        self.save()

    async def is_full(self):
        player1 = await sync_to_async(operator.attrgetter("player1"))(self)
        player2 = await sync_to_async(operator.attrgetter("player2"))(self)
        return player1 is not None and player2 is not None

    @classmethod
    def create_game(cls, user):
        game = cls.objects.create(player1=user, status="waiting")
        return game

    @classmethod
    def join_game(cls, user, game_id):
        game = cls.objects.filter(id=game_id, status="waiting").first()
        if game:
            game.player2 = user
            game.status = "in_progress"
            game.save()

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "general_requests_%s" % game.player1.pk,
                {
                    "type": "game.joined",
                    "game_id": game.id,
                },
            )
            async_to_sync(channel_layer.group_send)(
                "general_requests_%s" % user.pk,
                {
                    "type": "game.joined",
                    "game_id": game.id,
                },
            )
            return game
        else:
            return None

    def start_game(self):
        if self.status == "in_progress":
            self.status = "started"
            self.save()

    def end_game(self, winner, player1_score, player2_score):
        self.winner = winner
        self.loser = self.player1 if self.player2 == winner else self.player2
        self.status = "completed"
        self.save()

        winner.wins += 1
        winner.save()

        self.loser.losses += 1
        self.loser.save()

        game_history = GameHistory.objects.create(
            winner=winner, player1_score=player1_score, player2_score=player2_score
        )
        game_history.players.add(self.player1, self.player2)

    @classmethod
    def join_queue(cls, user):
        queue = MatchmakingQueue.objects.order_by("timestamp")
        if queue.exists():
            opponent = queue.first().player
            queue.first().delete()
            game = cls.objects.create(
                player1=user, player2=opponent, status="in_progress"
            )
        else:
            MatchmakingQueue.objects.create(player=user)
            game = None

        if game:
            channel_layer = get_channel_layer()
            # Send a WebSocket message with the game id
            async_to_sync(channel_layer.send)(
                "general_requests_%s" % user.pk,
                {"type": "send.game_id", "game_id": game.id},
            )
        return game


class MatchmakingQueue(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
