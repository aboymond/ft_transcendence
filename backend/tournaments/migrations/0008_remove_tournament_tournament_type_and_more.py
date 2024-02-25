# Generated by Django 4.2.9 on 2024-02-13 19:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0007_tournament_max_score'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournament',
            name='tournament_type',
        ),
        migrations.AlterField(
            model_name='tournament',
            name='status',
            field=models.CharField(choices=[('waiting', 'Waiting for Player'), ('in_progress', 'In Progress'), ('completed', 'Completed')], default='waiting', max_length=11),
        ),
    ]
