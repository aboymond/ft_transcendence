from django.db import models
from django.conf import settings
from games.models import Game

# from itertools import combinations
from django_prometheus.models import ExportModelOperationsMixin


class Tournament(ExportModelOperationsMixin("Tournament"), models.Model):
    STATUS_CHOICES = [
        ("waiting", "Waiting for Player"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    name = models.CharField(max_length=15, default="Tournament")
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="tournaments_created",
        on_delete=models.CASCADE,
    )
    max_participants = models.IntegerField(default=4)
    max_score = models.IntegerField(default=5)

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="tournaments"
    )
    games = models.ManyToManyField(Game, related_name="tournaments", blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=11,
        choices=STATUS_CHOICES,
        default="waiting",
    )
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="tournaments_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def add_participant(self, user):
        if self.participants.count() < self.max_participants:
            self.participants.add(user)
            self.save()
        else:
            raise Exception("Tournament is full")

    @classmethod
    def start_single_elimination(cls, tournament):
        players = list(tournament.participants.all())
        order = 1
        while len(players) > 1:
            new_round_players = []
            for i in range(0, len(players), 2):
                match = Match.objects.create(
                    tournament=tournament,
                    player1=players[i],
                    player2=players[i + 1],
                    order=order,
                )
                game = Game.objects.create(
                    player1=players[i],
                    player2=players[i + 1],
                    max_score=tournament.max_score,
                    status="waiting",
                )
                match.game = game
                match.save()

                order += 1
                if game.winner:
                    new_round_players.append(game.winner)

            players = new_round_players
        if players:
            tournament.winner = players[0]
            tournament.status = "completed"
            tournament.save()


class Match(ExportModelOperationsMixin("Match"), models.Model):
    tournament = models.ForeignKey(
        Tournament, related_name="matches", on_delete=models.CASCADE
    )
    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="matches_as_player1",
        on_delete=models.CASCADE,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="matches_as_player2",
        on_delete=models.CASCADE,
    )
    order = models.IntegerField()
    game = models.OneToOneField(
        Game, related_name="match", on_delete=models.CASCADE, null=True, blank=True
    )
