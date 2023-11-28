from django.db import models
from django.conf import settings
from games.models import Game
from itertools import combinations


class Tournament(models.Model):
    SINGLE_ELIMINATION = "SE"
    ROUND_ROBIN = "RR"

    TOURNAMENT_TYPES = [
        (SINGLE_ELIMINATION, "Single Elimination"),
        (ROUND_ROBIN, "Round Robin"),
    ]

    CREATED = "CR"
    IN_PROGRESS = "IP"
    COMPLETED = "CO"

    STATUS_CHOICES = [
        (CREATED, "Created"),
        (IN_PROGRESS, "In Progress"),
        (COMPLETED, "Completed"),
    ]

    name = models.CharField(max_length=255)
    max_participants = models.IntegerField()
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="tournaments"
    )
    games = models.ManyToManyField(Game, related_name="tournaments", blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    tournament_type = models.CharField(
        max_length=2, choices=TOURNAMENT_TYPES, default=SINGLE_ELIMINATION
    )
    status = models.CharField(
        max_length=2,
        choices=STATUS_CHOICES,
        default=CREATED,
    )
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="tournaments_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    @classmethod
    def create_tournament(cls, name, tournament_type, max_participants):
        tournament = cls.objects.create(
            name=name,
            tournament_type=tournament_type,
            max_participants=max_participants,
            status=cls.CREATED,
        )
        return tournament

    def add_participant(self, user):
        if self.participants.count() < self.max_participants:
            self.participants.add(user)
            self.save()
            if self.participants.count() == self.max_participants:
                if self.tournament_type == self.SINGLE_ELIMINATION:
                    self.start_single_elimination(self)
                elif self.tournament_type == self.ROUND_ROBIN:
                    self.start_round_robin(self)
        else:
            raise Exception("Tournament is full")

    @classmethod
    def start_single_elimination(cls, tournament):
        players = list(tournament.participants.all())
        while len(players) > 1:
            for i in range(0, len(players), 2):
                game = Game.objects.create(
                    player1=players[i], player2=players[i + 1], status="in_progress"
                )
                tournament.games.add(game)
            winners = [
                game.winner
                for game in tournament.games.all()
                if game.winner is not None
            ]
            players = winners
        if players:
            tournament.winner = players[0]
            tournament.status = cls.COMPLETED
            tournament.save()

    @classmethod
    def start_round_robin(cls, tournament):
        players = list(tournament.participants.all())
        for player1, player2 in combinations(players, 2):
            game = Game.objects.create(
                player1=player1, player2=player2, status="in_progress"
            )
            tournament.games.add(game)
        winners = [
            game.winner for game in tournament.games.all() if game.winner is not None
        ]
        winner = max(winners, key=winners.count)
        tournament.winner = winner
        tournament.status = cls.COMPLETED
        tournament.save()
