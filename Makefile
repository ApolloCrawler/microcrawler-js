REPORTER ?= list
SRC = $(shell find lib -name "*.js" -type f | sort)

test: test-unit

test-unit:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		test/*.js

.PHONY: test-unit