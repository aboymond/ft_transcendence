NAME		=	transcendence
DIR			=	/
#DEV_COMPOSE	=	-f ${DIR} docker-compose.dev.yml
COMPOSE	=	-f ${DIR} docker-compose.yml
ENV			=	--env-file .env
DOCKER		=	docker compose ${ENV} -p ${NAME}
#DEV_DOCKER		=	docker compose ${DEV_COMPOSE} ${ENV} -p ${NAME}

all:			build start

build:
				${DOCKER} build

start:
				${DOCKER} up -d

dev:			build
				${DEV_DOCKER} up -d

down:
				${DOCKER} down

clean:			
				${DOCKER} down --volumes

pclean:
				docker system prune -af

vclean:
				docker volume prune -f

aclean:			clean pclean vclean

re:				clean all

.PHONY: all build start down clean vclean pclean re