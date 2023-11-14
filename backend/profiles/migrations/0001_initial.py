# Generated by Django 4.2.7 on 2023-11-10 00:20

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('avatar', models.ImageField(default='profiles/avatars/default.jpg', upload_to='profiles/avatars/')),
                ('bio', models.TextField(blank=True)),
            ],
        ),
    ]