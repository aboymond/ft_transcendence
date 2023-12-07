from django.core.management.base import BaseCommand
from django.utils.crypto import get_random_string
from users.models import CustomUser, GameHistory, Friendship
from games.models import Game
from tournaments.models import Tournament, Match
from random import choice, randint
from itertools import combinations
from datetime import timedelta
from django.utils import timezone


class Command(BaseCommand):
    help = "Create random users, games, tournaments, and friendships"

    def add_arguments(self, parser):
        parser.add_argument(
            "total", type=int, help="Indicates the number of users to be created"
        )

    def handle(self, *args, **kwargs):
        total = kwargs["total"]
        users = [
            CustomUser.objects.create(username=get_random_string(10), password="123")
            for _ in range(total)
        ]

        # Create friendships
        for user1, user2 in combinations(users, 2):
            Friendship.objects.create(
                requester=user1,
                receiver=user2,
                status=choice(Friendship.STATUS_CHOICES)[0],
            )

        # Create games and game histories
        for user1, user2 in combinations(users, 2):
            player1_score = randint(0, 10)
            player2_score = randint(0, 10)

            # Ensure the winner's score is higher
            if player1_score == player2_score:
                if randint(0, 1) == 0:
                    winner, loser = user1, user2
                    player1_score += 1
                else:
                    winner, loser = user2, user1
                    player2_score += 1
            elif player1_score > player2_score:
                winner, loser = user1, user2
            else:
                winner, loser = user2, user1

            # Generate random start and end times
            start_time = timezone.now() - timedelta(days=randint(0, 30))
            end_time = start_time + timedelta(hours=randint(1, 24))

            game = Game.objects.create(
                player1=user1,
                player2=user2,
                status="completed",
                winner=winner,
                loser=loser,
                player1_score=player1_score,
                player2_score=player2_score,
                start_time=start_time,
                end_time=end_time,
            )

        game_history = GameHistory.objects.create(
            winner=winner, player1_score=player1_score, player2_score=player2_score
        )
        game_history.players.set([user1, user2])

        # Create tournaments and matches
        i = 0
        while i < total:
            max_participants = choice([2, 4, 6, 8])
            if i + max_participants > total:
                # Not enough users left to create a tournament with max_participants participants
                break
            tournament = Tournament.objects.create(
                name=get_random_string(10),
                max_participants=max_participants,
                creator=users[i],  # Set the creator to be one of the users
            )
            participants = users[i : i + max_participants]
            tournament.participants.set(participants)
            for order, (player1, player2) in enumerate(combinations(participants, 2)):
                Match.objects.create(
                    tournament=tournament,
                    player1=player1,
                    player2=player2,
                    order=order,
                )
            i += max_participants

        self.stdout.write(self.style.SUCCESS("Data created successfully!!"))
