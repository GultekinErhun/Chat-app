all:
	docker compose down
	docker compose build
	docker compose up -d
	python3 migrations/migrate.py

build-no-cache:
	docker compose build --no-cache

build:
	docker compose build

run:
	docker compose up -d
kill:
	docker compose down	


migrate:
	python3 migrations/migrate.py


