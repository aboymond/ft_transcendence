# Default rule that gets executed when you run just `make`
default: up

# Rule to start all services
up:
	docker-compose up -d

dev:
	docker-compose up --build

# Rule to stop all services
down:
	docker-compose down

# Rule to build or rebuild services
build:
	docker-compose build

# Rule to run migrations
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

.PHONY:	default up down build migrate superuser logs shell test collectstatic clean pclean vclean aclean re
