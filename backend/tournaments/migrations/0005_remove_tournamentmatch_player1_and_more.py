# Generated by Django 4.2.7 on 2023-11-15 16:49

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('matches', '0002_remove_match_played_at_remove_match_player1_score_and_more'),
        ('tournaments', '0004_rename_match_tournamentmatch'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='player1',
        ),
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='player2',
        ),
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='tournament',
        ),
        migrations.RemoveField(
            model_name='tournamentmatch',
            name='winner',
        ),
        migrations.AddField(
            model_name='tournament',
            name='matches',
            field=models.ManyToManyField(blank=True, related_name='tournaments', to='matches.match'),
        ),
        migrations.AddField(
            model_name='tournament',
            name='participants',
            field=models.ManyToManyField(related_name='tournaments', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='tournament',
            name='status',
            field=models.CharField(default='Created', max_length=255),
        ),
        migrations.AlterField(
            model_name='round',
            name='matches',
            field=models.ManyToManyField(blank=True, related_name='rounds', to='matches.match'),
        ),
        migrations.DeleteModel(
            name='PlayerProfile',
        ),
        migrations.DeleteModel(
            name='TournamentMatch',
        ),
    ]