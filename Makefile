SHELL := /bin/bash

COMPOSE := docker compose -f infra/compose.yml
UV := uv run --project backend

.PHONY: deps-up deps-down up down lint typecheck test smoke

deps-up:
	$(COMPOSE) up -d --wait --wait-timeout 180 postgres redis qdrant

deps-down:
	$(COMPOSE) down

up:
	$(COMPOSE) --profile full up -d --build --wait --wait-timeout 600

down:
	$(COMPOSE) --profile full down

lint:
	$(UV) ruff check backend
	$(UV) ruff format --check backend

typecheck:
	$(UV) mypy --config-file backend/pyproject.toml backend/app

test: deps-up
	$(UV) --env-file infra/env.test pytest backend/tests

smoke:
	@set -e; \
	trap 'rc=$$?; $(MAKE) --no-print-directory down; exit $$rc' EXIT; \
	$(MAKE) --no-print-directory up; \
	curl -sf --max-time 5 http://127.0.0.1:58000/healthz > /dev/null; \
	curl -sf --max-time 5 http://127.0.0.1:58000/metrics | grep -q python_info
