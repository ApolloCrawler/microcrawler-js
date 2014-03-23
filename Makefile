# Inspired by https://raw.githubusercontent.com/visionmedia/mocha/master/Makefile

REPORTER ?= list
SRC = $(shell find lib -name "*.js" -type f | sort)

test: test-unit

test-unit:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		test/*.js

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha \
	    --report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

.PHONY: test-unit
