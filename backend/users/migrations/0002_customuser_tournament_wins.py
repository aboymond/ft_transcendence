# Generated by Django 4.2.7 on 2023-11-28 00:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='tournament_wins',
            field=models.IntegerField(default=0),
        ),
    ]