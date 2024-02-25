# Generated by Django 4.2.9 on 2024-02-08 20:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0015_game_player1_ready_game_player2_ready'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='status',
            field=models.CharField(choices=[('empty', 'Empty'), ('waiting', 'Waiting for Player'), ('in_progress', 'In Progress'), ('completed', 'Completed')], default='waiting', max_length=15),
        ),
    ]
