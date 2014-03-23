# Inspired by https://raw.githubusercontent.com/visionmedia/mocha/master/Makefile

REPORTER ?= list
SRC = $(shell find lib -name "*.js" -type f | sort)

all: clean doc test

clean:
	rm -rf coverage
	rm -rf docs/lib

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha \
	    --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

doc:
	@jsdoc --verbose --destination docs/lib lib/*.js

test: test-unit

test-unit:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		test/

ci: clean cover

.PHONY: clean cover doc test test-unit
