from django.db import models
from django.conf import settings
from django.utils import timezone
from django_prometheus.models import ExportModelOperationsMixin
from games.models import Game
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async


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
        next_round_matches = Match.objects.filter(
            tournament=tournament, round_number=round_number + 1
        )
        if next_round_matches.exists():
            print("Matches for the next round have already been created.")
            return
        # Check if it's the initial round
        if round_number == 1:
            # Assuming winners list contains all participants for the initial setup
            participants = winners
        elif round_number == 3:
            print("Tournament completed")
            tournament.status = "completed"
            tournament.end_date = timezone.now()

            if isinstance(winners, list) and len(winners) > 0:
                if isinstance(winners[0], list) and len(winners[0]) > 0:
                    tournament.winner = winners[0][0]
                else:
                    tournament.winner = winners[0]
            else:
                tournament.winner = None
            if tournament.winner is not None:
                tournament.winner.tournament_wins += 1
                tournament.winner.save()
                tournament.save()
            else:
                print("No winner found for tournament", tournament.name)

            channel_layer = get_channel_layer()
            for participant in tournament.participants.all():
                group_name = f"general_requests_{participant.id}"  # Construct the group name for each participant
                message = {
                    "type": "tournament_message_end",
                    "tournament_id": tournament.id,
                    "tournament_name": tournament.name,
                    "winner_id": tournament.winner.id,
                    "winner_username": tournament.winner.display_name,
                }
                async_to_sync(channel_layer.group_send)(group_name, message)
            return
        else:
            # For subsequent rounds, fetch or wait for winners
            round_progress, created = RoundProgress.objects.get_or_create(
                tournament=tournament, round_number=round_number
            )
            if not isinstance(winners, (list, tuple)):
                winners = [winners]
            for winner in winners:
                if hasattr(winner, "id"):
                    print("Adding winner", winner, "for round", round_number)
                    round_progress.awaiting_winners.add(winner.id)
            participants = list(round_progress.awaiting_winners.all())
            print("Participants for round", round_number, ":", participants)

        # Create matches if there are enough participants
        match_order = 1
        while len(participants) >= 2:
            # Pop the first two participants to create a match
            player1, player2 = participants.pop(0), participants.pop(0)

            match = Match.objects.create(
                tournament=tournament,
                player1=player1,
                player2=player2,
                round_number=round_number,
                match_order=match_order,
            )

            print(
                "Creating game for match",
                match.id,
                "in round",
                round_number,
                "match",
                match_order,
                "between",
                player1,
                "and",
                player2,
            )
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

            match_order += 1

            # For subsequent rounds, remove the winners from awaiting_winners
            if round_number != 1:
                round_progress.awaiting_winners.remove(player1, player2)

        # Handle any remaining participant for odd numbers
        if round_number == 1 and participants:
            pass

    @classmethod
    def get_next_round_number(cls, tournament):
        last_match = tournament.matches.order_by("-round_number").first()
        if last_match:
            return last_match.round_number + 1
        else:
            return 1

    async def game_ended(self, winner):
        # Convert the synchronous method call to asynchronous
        current_round_number = await database_sync_to_async(
            self.get_current_round_number
        )()
        print("Game ended for round", current_round_number)
        await database_sync_to_async(self.track_winner_for_round)(
            winner, current_round_number
        )
        if await database_sync_to_async(self.all_games_completed_for_round)(
            current_round_number
        ):
            winners = await database_sync_to_async(self.get_winners_for_round)(
                current_round_number
            )
            next_round_number = current_round_number + 1
            await database_sync_to_async(self.create_matches_for_round)(
                self, winners, next_round_number
            )

    def get_current_round_number(self):
        last_match = self.matches.order_by("-round_number").first()
        if last_match:
            return last_match.round_number
        else:
            return 1

    def track_winner_for_round(self, winner, round_number):
        round_progress, _ = RoundProgress.objects.get_or_create(
            tournament=self, round_number=round_number
        )
        round_progress.awaiting_winners.add(winner)
        round_progress.save()

    def all_games_completed_for_round(self, round_number):
        round_progress = RoundProgress.objects.filter(
            tournament=self, round_number=round_number
        ).first()
        if round_progress:
            completed_games_count = round_progress.awaiting_winners.count()
            total_games_count = self.matches.filter(round_number=round_number).count()
            return completed_games_count == total_games_count
        return False

    def get_winners_for_round(self, round_number):
        round_progress = RoundProgress.objects.filter(
            tournament=self, round_number=round_number
        ).first()
        print("Fetching winners for round", round_number)
        if round_progress:
            print(
                "Winners for round",
                round_number,
                ":",
                round_progress.awaiting_winners.all(),
            )
            return list(round_progress.awaiting_winners.all())
        return []


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
