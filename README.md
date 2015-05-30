# microcrawler

## Status

[![GitHub version](https://badge.fury.io/gh/korczis%2Fmicrocrawler.png)](http://badge.fury.io/gh/korczis%2Fmicrocrawler)
[![Dependency Status](https://gemnasium.com/korczis/microcrawler.svg)](https://gemnasium.com/korczis/microcrawler)
[![Code Climate](https://codeclimate.com/github/korczis/microcrawler.png)](https://codeclimate.com/github/korczis/microcrawler)
[![Coverage Status](https://coveralls.io/repos/korczis/microcrawler/badge.png)](https://coveralls.io/r/korczis/microcrawler)
[![Build Status](https://travis-ci.org/korczis/microcrawler.png)](https://travis-ci.org/korczis/microcrawler)
[![Downloads](http://img.shields.io/npm/dm/microcrawler.svg)](https://www.npmjs.org/package/microcrawler)

[![NPM](https://nodei.co/npm/microcrawler.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/microcrawler/)

## Prerequisites

- [node.js](http://nodejs.org/)
- [npm](https://www.npmjs.org/)
- [grunt](http://gruntjs.com/getting-started)

## Getting started

Just clone.

```
# Clone repository
git clone https://github.com/korczis/microcrawler.git

# Enter folder
cd microcrawler

# Install required packages
npm install

# Run tests
grunt
```

## Usage

```
$ node app.js -h

Usage: node app.js [options]

Options:
   -e, --elasticsearch     Index data in elasticsearch  [false]
   -d, --directory         Directory with processors  [/Users/tomaskorcak/dev/microcrawler/examples]
   -f, --flush             Flush existing queue  [false]
   -n, --num-connections   Max count of parallel requests  [10]
   -o, --output            Print crawled data  [true]
   -p, --processor         Processor to be used for URLs
   -r, --rest              Start Web Interface at port 3000  [false]
   -s, --stats             Shows statistics  [false]
   -i, --stats-interval    Interval between printing statistics  [10]
   -v, --version           print version and exit

```

## Example usage

### Craiglist

```
node app.js -p craiglist.listing http://sfbay.craigslist.org/sfc/sss/
```

### Google

```
node app.js -p google.listing http://google.com/search?q=Buena+Vista
```

### Hacker News

```
node app.js -p hackernews.index https://news.ycombinator.com/
```

### xkcd

```
node app.js -p xkcd.listing http://xkcd.com
```

### Yelp

```
node app.js -p yelp.listing "http://www.yelp.com/search?find_desc=restaurants&find_loc=Los+Angeles%2C+CA&ns=1&ls=f4de31e623458437"
```

### Youjizz

```
node app.js -p youjizz.listing http://youjizz.com
```

## Credits

- [@pavelbinar](https://github.com/pavelbinar) for QA and not just that.
