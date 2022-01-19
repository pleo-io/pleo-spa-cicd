# Get the number of CPUs and allow building in parallel
NPROCS = $(shell sysctl hw.ncpu  | grep -o '[0-9]\+')
MAKEFLAGS += -j$(NPROCS)

all: test cursor-deploy/dist/main/index.js s3-cache/dist/restore/index.js s3-cache/dist/save/index.js post-preview-urls/dist/main/index.js

s3-cache/dist/%/index.js: s3-cache/%.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< -o $(dir $@)

%/dist/main/index.js: %/main.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< -o $(dir $@)

test: package.json
	./node_modules/.bin/jest

node_modules: package.json
	if ! test -d node_modules; then yarn; fi

.PHONY: all
