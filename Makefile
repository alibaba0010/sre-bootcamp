VERSION ?= 1.0
SHELL := /bin/bash

.PHONY: install build start dev test migrate docker-build docker-run docker-push check-dependencies start-db run-migrations start-api stop clean setup-dev logs

# Check for required tools
check-dependencies:
	@echo "Checking for required tools..."
	@echo "Checking dependencies..."
	@which docker >/dev/null 2>&1 || (echo "Docker is not installed. Please install Docker first." && exit 1)
	@which make >/dev/null 2>&1 || (echo "Make is not installed. Please install Make first." && exit 1)

# Start database
start-db:
	@echo "Starting database..."
	docker compose up -d db
	@echo "Waiting for database to be ready..."
	@until docker compose exec db pg_isready -U alibaba -d sre_bootcamp; do sleep 2; done

# Run database migrations
run-migrations: start-db
	@echo "Running migrations..."
	# npm run migrate
	# node dist/db/migrations.js
	docker compose exec api node dist/db/migrations.js
	@echo "Migrations completed"

# Build API image
docker-build:
	docker compose build api

# Start API container
start-api: start-db run-migrations
	@echo "Starting API..."
	docker compose up -d api
	@echo "Waiting for migrations to complete..."
	@sleep 5
	make run-migrations

# Stop all services
stop:
	docker compose down

# Clean everything
clean:
	docker compose down -v
	
	rm -rf node_modules dist

# Development setup
setup-dev: check-dependencies
	@echo "Setting up development environment..."
	# npm install
	docker compose build
	make start-api
	 

# Show logs
logs:
	docker compose logs -f

# Existing targets...
install:
	npm install

build:
	npm run build

start:
	npm start

dev:
	npm run dev

test:
	npm test

migrate:
	node dist/db/migrations.js

docker-run:
	docker run -p 3004:3004 --env-file .env sre-bootcamp\:$(VERSION)

docker-push:
   docker tag sre-bootcamp:$(VERSION) alibaba0010/sre-bootcamp\:$(VERSION)
   docker push your-registry/sre-bootcamp:$(VERSION)