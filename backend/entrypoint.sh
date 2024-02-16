#!/bin/sh

set -e

# Apply database migrations
echo "Applying database migrations..."
yes | python manage.py makemigrations --merge
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

export DJANGO_SETTINGS_MODULE=project.settings

# Start server
echo "Starting server..."
# python manage.py runserver 0.0.0.0:8000
uvicorn project.asgi:application --host 0.0.0.0 --port 8000 --reload #--log-level debug
