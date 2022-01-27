build: dist/viewer-request/index.js dist/viewer-response/index.js

dist/%/index.js: src/%/index.ts src/%/*.ts src/*.ts node_modules
	node_modules/.bin/ncc build -e aws-sdk/clients/s3 $< -o $(dir $@)

node_modules: package.json
	if ! test -d node_modules; then yarn; fi

test: node_modules
	node_modules/.bin/jest .

lint: node_modules
	yarn prettier --check .

clean:
	rm -r dist

.PHONY: test lint