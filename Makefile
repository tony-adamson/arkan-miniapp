SHELL := /bin/bash

COMPOSE := docker compose -f infra/compose.yml
UV := uv run --project backend
ENV_FILE := infra/env.test

.PHONY: deps-up deps-down db-create up down migrate lint typecheck test smoke validate-base

deps-up:
	$(COMPOSE) up -d --wait --wait-timeout 180 postgres redis qdrant

deps-down:
	$(COMPOSE) down

# Идемпотентно создаёт БД из DATABASE_URL (infra/env.test) через psql в контейнере:
# нужна `migrate` и тестам на чистой машине.
db-create: deps-up
	@set -e; \
	db=$$(sed -n 's|^DATABASE_URL=.*/\([^/?]*\)$$|\1|p' $(ENV_FILE)); \
	user=$$(sed -n 's|^DATABASE_URL=[^:]*://\([^:]*\):.*|\1|p' $(ENV_FILE)); \
	if ! $(COMPOSE) exec -T postgres psql -U "$$user" -d postgres -tAc \
		"SELECT 1 FROM pg_database WHERE datname='$$db'" | grep -q 1; then \
		$(COMPOSE) exec -T postgres psql -U "$$user" -d postgres -c "CREATE DATABASE \"$$db\""; \
	fi

# Порядок: зависимости -> образ api -> миграция -> старт стека. Миграция до старта
# api (SOLUTION §9.8). Образ api несёт только `app/`, поэтому файлы Alembic
# подмонтируются в одноразовый контейнер (правка Dockerfile — вне фазы 2).
up: deps-up
	$(COMPOSE) --profile full build api
	$(COMPOSE) --profile full run --rm \
		-v $(CURDIR)/backend/alembic.ini:/app/alembic.ini:ro \
		-v $(CURDIR)/backend/migrations:/app/migrations:ro \
		api alembic upgrade head
	$(COMPOSE) --profile full up -d --wait --wait-timeout 600

down:
	$(COMPOSE) --profile full down

migrate: db-create
	$(UV) --env-file $(ENV_FILE) alembic -c backend/alembic.ini upgrade head

lint:
	$(UV) ruff check backend
	$(UV) ruff format --check backend

typecheck:
	$(UV) mypy --config-file backend/pyproject.toml backend/app

test: db-create
	$(UV) --env-file $(ENV_FILE) pytest backend/tests

# Волна эксперта: CSV из Google Sheets -> отчёт -> YAML базы (CON-5). Отчёт
# печатается построчно; exit 1, пока в волне есть ошибки. Пустые CSV/OUT — не
# опечатка: без OUT `Path("")` — это `.`, и YAML уехал бы в корень репозитория.
validate-base:
	@[ -n "$(CSV)" ] && [ -n "$(OUT)" ] || { echo "usage: make validate-base CSV=<csv_dir> OUT=<out_dir>"; exit 2; }
	PYTHONPATH=backend $(UV) python -m tools.validate_base "$(CSV)" "$(OUT)"

smoke:
	@set -e; \
	trap 'rc=$$?; $(MAKE) --no-print-directory down; exit $$rc' EXIT; \
	$(MAKE) --no-print-directory up; \
	curl -sf --max-time 5 http://127.0.0.1:58000/healthz > /dev/null; \
	curl -sf --max-time 5 http://127.0.0.1:58000/metrics | grep -q python_info
