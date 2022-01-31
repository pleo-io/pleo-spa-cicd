# Attempt to run in parallel
MAKEFLAGS += -j3

all: test build

build: cursor-deploy/README.md cursor-deploy/dist/main/index.js 
build: s3-cache/README.md s3-cache/dist/restore/index.js s3-cache/dist/save/index.js
build: post-preview-urls/README.md post-preview-urls/dist/main/index.js
build:
	./node_modules/.bin/prettier -w .

s3-cache/dist/%/index.js: s3-cache/%.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< --out $(dir $@)

%/dist/main/index.js: %/main.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< --out $(dir $@)

%/README.md: %/action.yml node_modules
	cd $(dir $<) && ../node_modules/.bin/action-docs --update-readme --no-banner

test: node_modules
	./node_modules/.bin/jest

lint: node_modules
	./node_modules/.bin/prettier --check .

node_modules: package.json
	if ! test -d node_modules; then yarn; fi

.PHONY: all build test
