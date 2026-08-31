SERVICES := message_db precence_service chat_service notification_service client

.PHONY: up down restart logs ps infra install test build clean

up:
	docker compose up -d --build

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f message-storage chat-api presence-service notification-service demo-client

ps:
	docker compose ps

infra:
	docker compose up -d postgres redis zookeeper kafka kafka-init kafka-ui

install:
	for s in $(SERVICES); do (cd $$s && npm ci) || exit 1; done

test:
	for s in $(SERVICES); do (cd $$s && npm test) || exit 1; done

build:
	for s in $(SERVICES); do (cd $$s && npm run build) || exit 1; done

clean:
	docker compose down -v
