# Generated by Django 4.2.7 on 2023-11-28 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_game_loser'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='player1_score',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='player2_score',
            field=models.IntegerField(default=0),
        ),
    ]