from django.core.management.base import BaseCommand
from users.models import CustomUser, GameHistory, Friendship
from games.models import Game
from tournaments.models import Tournament, Match


class Command(BaseCommand):
    help = "Delete users, games, tournaments, and friendships"

    def handle(self, *args, **kwargs):
        GameHistory.objects.all().delete()
        Friendship.objects.all().delete()
        Game.objects.all().delete()
        Match.objects.all().delete()
        Tournament.objects.all().delete()
        CustomUser.objects.exclude(username="admin").delete()

        self.stdout.write(self.style.SUCCESS("Data deleted successfully!!"))
