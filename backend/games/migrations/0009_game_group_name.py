# Generated by Django 4.2.9 on 2024-01-31 15:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0008_game_pad1_y_game_pad2_y_game_player_turn'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='group_name',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]