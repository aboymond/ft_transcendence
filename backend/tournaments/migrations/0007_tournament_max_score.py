# Generated by Django 4.2.9 on 2024-01-23 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0006_tournament_creator'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='max_score',
            field=models.IntegerField(default=5),
        ),
    ]