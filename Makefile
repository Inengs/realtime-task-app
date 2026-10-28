.PHONY: dev down test prod-local prod-local-down config-prod

dev: ## local app: web :3000, api :8080, mail inbox :8025
	docker compose up --build

down: ## stop local containers (data kept)
	docker compose down

test: ## run the Go tests against a throwaway database
	docker compose -f docker-compose.test.yml run --rm tests; s=$$?; docker compose -f docker-compose.test.yml down -v; exit $$s

prod-local: ## production build + Caddy on http://taskflow.localhost
	docker compose --env-file .env.prodlocal -p taskflow-prodlocal -f docker-compose.yml -f docker-compose.prod.yml up --build

prod-local-down:
	docker compose --env-file .env.prodlocal -p taskflow-prodlocal -f docker-compose.yml -f docker-compose.prod.yml down

config-prod: ## print the fully-resolved prod config (needs .env.prodlocal)
	docker compose --env-file .env.prodlocal -f docker-compose.yml -f docker-compose.prod.yml config
