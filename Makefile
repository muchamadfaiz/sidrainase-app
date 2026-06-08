.PHONY: help up down restart build logs logs-db shell shell-db db-reset seed migrate studio deploy

# Auto-detect Compose command: V2 plugin ("docker compose") atau V1 ("docker-compose")
DC := $(shell docker compose version >/dev/null 2>&1 && echo "docker compose" || echo "docker-compose")

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services (build + migrate + start)
	$(DC) up --build -d
	@echo "Waiting for database..."
	@sleep 5
	$(DC) exec app npx prisma migrate deploy
	@echo "Done! App running at http://localhost:3000"

down: ## Stop all services
	$(DC) down

restart: ## Restart all services
	$(DC) down
	$(DC) up --build -d
	@echo "Waiting for database..."
	@sleep 5
	$(DC) exec app npx prisma migrate deploy

build: ## Build without starting
	$(DC) build

logs: ## Tail app logs
	$(DC) logs -f app

logs-db: ## Tail database logs
	$(DC) logs -f db

shell: ## Open shell in app container
	$(DC) exec app sh

shell-db: ## Open psql in database container
	$(DC) exec db sh -c 'psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

db-reset: ## Stop, wipe database volume, and restart
	$(DC) down -v
	$(DC) up --build -d
	@echo "Waiting for database..."
	@sleep 5
	$(DC) exec app npx prisma migrate deploy

seed: ## Run prisma seed inside app container
	$(DC) exec app npx tsx prisma/seed.ts

migrate: ## Run prisma migrate inside app container
	$(DC) exec app npx prisma migrate deploy

studio: ## Run prisma studio (port 5555)
	$(DC) exec -p 5555:5555 app npx prisma studio

deploy: ## Pull latest code, rebuild & restart
	git pull
	$(DC) up --build -d
	@echo "Waiting for database..."
	@sleep 5
	$(DC) exec app npx prisma migrate deploy
	@echo "Deploy done!"
