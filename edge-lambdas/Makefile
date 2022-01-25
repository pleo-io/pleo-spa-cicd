all: dist/viewer-request/index.js dist/viewer-response/index.js

node_modules: package.json
	if ! test -d node_modules; then yarn; fi

dist/%/index.js: src/%/index.ts node_modules
	node_modules/.bin/ncc build -e aws-sdk/clients/s3 $< -o $(dir $@)

test: node_modules
	node_modules/.bin/jest .

clean:
	rm -r dist

.PHONY: test
.SILENT: