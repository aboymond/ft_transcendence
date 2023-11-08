# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV POETRY_VERSION 1.7

# Set work directory
WORKDIR /app

# Install Poetry
RUN pip install --no-cache-dir "poetry==$POETRY_VERSION"

# Copy project
COPY pyproject.toml poetry.lock* /app/

# Install dependencies
RUN poetry config virtualenvs.create false \
	&& poetry install --no-interaction --no-ansi

# Copy the rest of the code
COPY . /app/

# Copy entrypoint script into the container
COPY entrypoint.sh /app/entrypoint.sh

# Make sure the script is executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# You can add other Dockerfile commands below as needed
