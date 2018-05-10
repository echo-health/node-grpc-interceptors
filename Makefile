.PHONY: prune install depcheck lint test

all: depcheck lint test

prune:
	npm prune

install: prune
	npm install

depcheck: install
	npm run depcheck

lint: install
	npm run lint

test: install
	npm test
