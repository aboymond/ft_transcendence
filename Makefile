# Default rule that gets executed when you run just `make`
default: up

# Rule to start all services
up:
	docker-compose up -d

dev:
	docker-compose up --build

prod:
	docker-compose -f docker-compose.prod.yml up --build

# Rule to stop all services
down:
	docker-compose down

down-prod:
	docker-compose -f docker-compose.prod.yml down

# Rule to build or rebuild services
build:
	docker-compose build

# Rule to run migrations
migrations:
	docker-compose exec backend python manage.py makemigrations

migrate:
	docker-compose exec backend python manage.py migrate

# Rule to create Django superuser
superuser:
	docker-compose exec backend python manage.py createsuperuser

# Rule to check the logs of a service
# Usage: make logs service=backend
logs:
	docker-compose logs -f $(service)

# Rule to run Django shell
shell:
	docker-compose exec backend python manage.py shell

# Rule to run tests
test:
	docker-compose exec backend python manage.py test

test-app:
	docker-compose exec backend python manage.py test $(app)

# Rule to generate fake data
generate:
	docker-compose exec backend python manage.py generate_data 10

# Rule to delete all data
delete:
	docker-compose exec backend python manage.py delete_data

# Rule to collect static files
collectstatic:
	docker-compose exec backend python manage.py collectstatic --noinput

clean:
	docker-compose down --volumes

pclean:
	docker system prune -af

vclean:
	docker volume prune -f

aclean:	clean pclean vclean

re:	clean up

.PHONY:	default up dev down build migrations migrate superuser logs shell test collectstatic clean pclean vclean aclean re
