# Generated by Django 4.2.9 on 2024-02-08 20:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0016_alter_game_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='status',
            field=models.CharField(choices=[('empty', 'Empty'), ('waiting', 'Waiting for Player'), ('in_progress', 'In Progress'), ('completed', 'Completed')], default='empty', max_length=15),
        ),
    ]
