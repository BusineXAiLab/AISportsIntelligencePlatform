.PHONY: install lint test typecheck migrate seed run worker beat docker-up docker-down

install:
	pip install -e ".[dev]"

lint:
	ruff check app scripts
	ruff format --check app scripts

format:
	ruff format app scripts
	ruff check --fix app scripts

typecheck:
	mypy app

test:
	pytest app/tests -v --cov=app

migrate:
	alembic upgrade head

makemigration:
	alembic revision --autogenerate -m "$(m)"

seed:
	python scripts/seed_dev_data.py

run:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

worker:
	celery -A app.jobs.celery_app:celery_app worker --loglevel=INFO

beat:
	celery -A app.jobs.celery_app:celery_app beat --loglevel=INFO

docker-up:
	docker compose -f docker/docker-compose.yml up -d --build

docker-down:
	docker compose -f docker/docker-compose.yml down
