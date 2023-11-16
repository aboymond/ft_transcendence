from django.db import migrations

def populate_display_name(apps, schema_editor):
    CustomUser = apps.get_model('users', 'CustomUser')
    for user in CustomUser.objects.all():
        user.display_name = user.username
        user.save()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_customuser_display_name'),
    ]

    operations = [
        migrations.RunPython(populate_display_name),
    ]
