# Get the number of CPUs and allow building in parallel
NPROCS = $(shell sysctl hw.ncpu  | grep -o '[0-9]\+')
MAKEFLAGS += -j$(NPROCS)

all: test cursor-deploy/dist/main/index.js s3-cache/dist/restore/index.js s3-cache/dist/save/index.js post-preview-urls/dist/main/index.js

post-preview-urls/dist/main/index.js: post-preview-urls/main.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< -o $(dir $@)

cursor-deploy/dist/main/index.js: cursor-deploy/main.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< -o $(dir $@)

s3-cache/dist/%/index.js: s3-cache/%.ts utils.ts node_modules
	./node_modules/.bin/ncc build $< -o $(dir $@)

test: package.json
	./node_modules/.bin/jest

node_modules: package.json
	if ! test -d node_modules; then yarn; fi

clean:
	find src -name dist -type d -print0 | xargs -0 rm -r --

.PHONY: clean all
