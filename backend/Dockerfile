# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV POETRY_VERSION 1.7

# Set work directory
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN poetry config virtualenvs.create false \
	&& poetry install --no-interaction --no-ansi
RUN	pip install python-dotenv

# Copy the rest of the code
COPY . /app/

# Copy the default avatar into the container
COPY media/avatars/default_avatar.png /app/media/avatars/default_avatar.png

# Copy entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh

# Make sure the script is executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# You can add other Dockerfile commands below as needed
