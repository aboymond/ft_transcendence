from django.db import models
from django.conf import settings
from games.models import Game
from itertools import combinations
from django_prometheus.models import ExportModelOperationsMixin

class Tournament(ExportModelOperationsMixin("Tournament"), models.Model):
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
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="tournaments_created",
        on_delete=models.CASCADE,
    )
    max_participants = models.IntegerField()
    max_score = models.IntegerField(default=5)

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
        order = 1
        while len(players) > 1:
            for i in range(0, len(players), 2):
                Match.objects.create(
                    tournament=tournament,
                    player1=players[i],
                    player2=players[i + 1],
                    order=order,
                )
                order += 1
            winners = [
                game.winner
                for game in tournament.games.all()
                if game.winner is not None
            ]
            players = winners
        if players:
            tournament.winner = players[0]
            tournament.winner.tournament_wins += 1
            tournament.winner.save()

            tournament.status = cls.COMPLETED
            tournament.save()

    @classmethod
    def start_round_robin(cls, tournament):
        players = list(tournament.participants.all())
        order = 1
        for player1, player2 in combinations(players, 2):
            Match.objects.create(
                tournament=tournament, player1=player1, player2=player2, order=order
            )
            order += 1
        winners = [
            game.winner for game in tournament.games.all() if game.winner is not None
        ]
        winner = max(winners, key=winners.count)
        tournament.winner = winner
        tournament.winner.tournament_wins += 1
        tournament.winner.save()

        tournament.status = cls.COMPLETED
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

    def start_game(self):
        if self.player1.status == "online" and self.player2.status == "online":
            game = Game.objects.create(
                player1=self.player1, player2=self.player2, status="in_progress"
            )
            self.game = game
            self.save()
