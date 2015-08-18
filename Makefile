# Inspired by https://raw.githubusercontent.com/visionmedia/mocha/master/Makefile

REPORTER ?= list
SRC = $(shell find lib -name "*.js" -type f | sort)

clean:
	rm -rf coverage
	rm -rf docs/lib

cover:
	istanbul cover ./node_modules/mocha/bin/_mocha \
	    --report lcovonly -- --recursive -R spec --compilers js:mocha-traceur && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

doc:
	@jsdoc --verbose --destination docs/lib lib/*.js

report:
	istanbul cover ./node_modules/mocha/bin/_mocha  && \
	istanbul report

test: test-unit

test-unit:
	@./node_modules/.bin/mocha --recursive \
		--reporter $(REPORTER) \
		--growl \
		--compilers js:mocha-traceur  \
		test/

all: clean doc test

ci: clean cover

.PHONY: clean cover doc test test-unit
