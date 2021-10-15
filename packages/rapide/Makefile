ESBUILD = ./node_modules/.bin/esbuild
TSC = ./node_modules/.bin/tsc

fmt:
	deno fmt src scripts test index.d.ts
lint:
	deno lint src scripts test && ${TSC} -p . --noEmit
build:
	$(ESBUILD) src/cli.ts --bundle --minify --outfile=cli.js --platform=node --external:esbuild && \
	$(ESBUILD) src/client/index.ts --bundle --minify --format=esm --outfile=client.js
watch:
	$(ESBUILD) src/cli.ts --bundle --minify --watch --outfile=cli.js --platform=node --external:esbuild
clean:	
	rm -rf cli.js client.js cache
update:
	pnpm update --latest
test:
	afz test
check: clean fmt lint test build
	@echo ok
.PHONY: fmt lint build watch clean update test check