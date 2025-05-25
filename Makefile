VERSION ?= 1.0

.PHONY: install build start dev test migrate docker-build docker-run docker-push

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
	npm run migrate

docker-build:
	docker build -t sre-bootcamp:$(VERSION) .

docker-run:
	docker run -p 3004:3004 --env-file .env sre-bootcamp\:$(VERSION)

docker-push:
   docker tag sre-bootcamp:$(VERSION) alibaba0010/sre-bootcamp\:$(VERSION)
   docker push your-registry/sre-bootcamp:$(VERSION)