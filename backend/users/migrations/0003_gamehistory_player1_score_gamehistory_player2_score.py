# Generated by Django 4.2.7 on 2023-11-28 13:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_customuser_tournament_wins'),
    ]

    operations = [
        migrations.AddField(
            model_name='gamehistory',
            name='player1_score',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='gamehistory',
            name='player2_score',
            field=models.IntegerField(default=0),
        ),
    ]
