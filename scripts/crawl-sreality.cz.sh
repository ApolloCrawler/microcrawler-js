#! /usr/bin/env

node app.js -e --elasticsearch-index sreality.cz -p sreality.cz.listing \
    "http://www.sreality.cz/hledani/prodej/byty?some=thing&strana=1&per_page=60&_escaped_fragment_=" \
    "http://www.sreality.cz/hledani/prodej/domy?some=thing&strana=1&per_page=60&_escaped_fragment_=" \
    "http://www.sreality.cz/hledani/prodej/komercni?some=thing&strana=1&per_page=60&_escaped_fragment_=" \
    "http://www.sreality.cz/hledani/prodej/ostatni?some=thing&strana=1&per_page=60&_escaped_fragment_=" \
    "http://www.sreality.cz/hledani/prodej/pozemky?some=thing&strana=1&per_page=60&_escaped_fragment_="