# Generated by Django 4.2.9 on 2024-02-17 19:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0014_remove_tournament_games_roundprogress'),
        ('games', '0020_alter_game_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='tournament',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tournament_games', to='tournaments.tournament'),
        ),
        migrations.DeleteModel(
            name='MatchmakingQueue',
        ),
    ]
