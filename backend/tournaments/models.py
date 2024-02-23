from django.db import models
from django.conf import settings
from django.utils import timezone
from django_prometheus.models import ExportModelOperationsMixin
from games.models import Game
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class Tournament(ExportModelOperationsMixin("Tournament"), models.Model):
    STATUS_CHOICES = [
        ("waiting", "Waiting for Player"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    name = models.CharField(max_length=10, default="Tournament")
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
    # games = models.ManyToManyField(Game, related_name="tournaments", blank=True)
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
        tournament.status = "in_progress"
        tournament.start_date = timezone.now()
        tournament.save()
        players = list(tournament.participants.all())
        cls.create_matches_for_round(tournament, players, 1)

    @classmethod
    def create_matches_for_round(cls, tournament, winners, round_number):
        # Check if it's the initial round
        if round_number == 1:
            # Assuming winners list contains all participants for the initial setup
            participants = winners
        elif round_number == 3:
            print("Tournament completed")
            tournament.status = "completed"
            tournament.end_date = timezone.now()
            tournament.winner = winners[0]
            tournament.winner.tournament_wins += 1
            tournament.save()

            channel_layer = get_channel_layer()
            for participant in tournament.participants.all():
                group_name = f"general_requests_{participant.id}"  # Construct the group name for each participant
                message = {
                    "type": "tournament_message",
                    "tournament_id": tournament.id,
                    "tournament_name": tournament.name,
                    "winner_id": tournament.winner.id,
                    "winner_username": tournament.winner.username,
                }
                async_to_sync(channel_layer.group_send)(group_name, message)
            return
        else:
            # For subsequent rounds, fetch or wait for winners
            print("Fetching winners for round", round_number)
            round_progress, created = RoundProgress.objects.get_or_create(
                tournament=tournament, round_number=round_number
            )
            if not isinstance(winners, (list, tuple)):
                winners = [winners]
            for winner in winners:
                round_progress.awaiting_winners.add(winner.id)
            participants = list(round_progress.awaiting_winners.all())
            print("Participants for round", round_number, ":", participants)

        # Create matches if there are enough participants
        match_order = 1
        while len(participants) >= 2:
            # Pop the first two participants to create a match
            player1, player2 = participants.pop(0), participants.pop(0)

            print("Creating match for", player1, "vs", player2, "in round", round_number, "match", match_order)
            match = Match.objects.create(
                tournament=tournament,
                player1=player1,
                player2=player2,
                round_number=round_number,
                match_order=match_order,
            )
            match_order += 1

            print("Creating game for match", match.id, "in round", round_number, "match", match_order, "between", player1, "and", player2)
            game = Game.objects.create(
                status="empty",
                player1=player1,
                player2=player2,
                player_turn=player1.id,
                max_score=tournament.max_score,
                tournament_id=tournament.id,
            )
            match.game = game
            match.save()

            # For subsequent rounds, remove the winners from awaiting_winners
            if round_number != 1:
                round_progress.awaiting_winners.remove(player1, player2)

        # Handle any remaining participant for odd numbers
        if round_number == 1 and participants:
            # Logic to handle a single remaining participant, if any
            # This could involve automatically advancing them to the next round
            pass

    @classmethod
    def get_next_round_number(cls, tournament):
        last_match = tournament.matches.order_by("-round_number").first()
        if last_match:
            return last_match.round_number + 1
        else:
            return 1


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
    round_number = models.IntegerField()
    match_order = models.IntegerField()
    game = models.OneToOneField(
        Game, related_name="match", on_delete=models.CASCADE, null=True, blank=True
    )


class RoundProgress(models.Model):
    tournament = models.ForeignKey(
        Tournament, related_name="round_progress", on_delete=models.CASCADE
    )
    round_number = models.IntegerField(default=1)
    awaiting_winners = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="awaiting_next_round"
    )
