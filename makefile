build-no-cache:
	docker compose build --no-cache

build:
	docker compose build

run:
	docker compose up -d
kill:
	docker compose down	
