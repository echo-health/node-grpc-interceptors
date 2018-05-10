.PHONY: clean prune install depcheck lint test

all: clean depcheck lint test

clean:
	rm -f package-lock.json

prune:
	npm prune

install: package-lock.json

depcheck: install
	npm run depcheck

lint: install
	npm run lint

test: install
	npm test

package-lock.json:
	npm install
