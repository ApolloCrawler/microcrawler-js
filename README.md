# microcrawler

## Status

[![GitHub version](https://badge.fury.io/gh/korczis%2Fmicrocrawler.png)](http://badge.fury.io/gh/korczis%2Fmicrocrawler)
[![Dependency Status](https://gemnasium.com/korczis/microcrawler.svg)](https://gemnasium.com/korczis/microcrawler)
[![Code Climate](https://codeclimate.com/github/korczis/microcrawler.png)](https://codeclimate.com/github/korczis/microcrawler)
[![Coverage Status](https://coveralls.io/repos/korczis/microcrawler/badge.png)](https://coveralls.io/r/korczis/microcrawler)
[![Build Status](https://travis-ci.org/ApolloCrawler/microcrawler.png)](https://travis-ci.org/ApolloCrawler/microcrawler)
[![Downloads](http://img.shields.io/npm/dm/microcrawler.svg)](https://www.npmjs.org/package/microcrawler)

[![NPM](https://nodei.co/npm/microcrawler.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/microcrawler/)

## Screenshots

## Available Official Crawlers

List of official publicly available crawlers. 

***Missing something? Feel free to open issue.***

- [craiglist.com](http://craiglist.com) - [microcrawler-crawler-craiglist.com](https://github.com/ApolloCrawler/microcrawler-crawler-craiglist.com)
- [firmy.cz](http://firmy.cz) - [microcrawler-crawler-firmy.cz](https://github.com/ApolloCrawler/microcrawler-crawler-firmy.cz)
- [google.com](http://google.com) - [microcrawler-crawler-google.com](https://github.com/ApolloCrawler/microcrawler-crawler-google.com)
- [news.ycombinator.com](http://news.ycombinator.com) - [microcrawler-crawler-news.ycombinator.com](https://github.com/ApolloCrawler/microcrawler-crawler-news.ycombinator.com)
- [sreality.cz](http://sreality.cz) - [microcrawler-crawler-sreality.cz](https://github.com/ApolloCrawler/microcrawler-crawler-sreality.cz)
- [xkcd.com](http://xkcd.com) - [microcrawler-crawler-xkcd.com](https://github.com/ApolloCrawler/microcrawler-crawler-xkcd.com)
- [yelp.com](http://yelp.com) - [microcrawler-crawler-yelp.com](https://github.com/ApolloCrawler/microcrawler-crawler-yelp.com)
- [youjizz.com](http://youjizz.com) - [microcrawler-crawler-youjizz.com](https://github.com/ApolloCrawler/microcrawler-crawler-youjizz.com)

## Prerequisites

- [node.js](http://nodejs.org/)
- [npm](https://www.npmjs.org/)
- [libcouchbase](http://developer.couchbase.com/documentation/server/current/sdk/c/start-using-sdk.html)
- [docker](https://www.docker.com/)

## Installation

### From [npmjs.org](https://npmjs.org)

This is the easiest way. The prerequisites still needs to be satisfied.

```
npm install -g microcrawler
```

### From Sources

This is useful if you want to tweak the source code, implement new crawler, etc.

```
# Clone repository
git clone https://github.com/ApolloCrawler/microcrawler.git

# Enter folder
cd microcrawler

# Install required packages - dependencies
npm install

# Install from local sources
npm install -g .
```

## Usage

## Full Example 

### Pull elasticsearch

### Start elasticsearch

### Query elasticsearch

## Example usage

### Craiglist

```
microcrawler crawl craiglist.index http://sfbay.craigslist.org/sfc/sss/
```

### Firmy.cz

```
microcrawler crawl firmy.cz.index "https://www.firmy.cz?_escaped_fragment_="
```

### Google

```
microcrawler crawl google.index http://google.com/search?q=Buena+Vista
```

### Hacker News

```
microcrawler crawl hackernews.index https://news.ycombinator.com/
```

### xkcd

```
microcrawler crawl xkcd.index http://xkcd.com
```

### Yelp

```
microcrawler crawl yelp.index "http://www.yelp.com/search?find_desc=restaurants&find_loc=Los+Angeles%2C+CA&ns=1&ls=f4de31e623458437"
```

### Youjizz

```
microcrawler crawl youjizz.com.index http://youjizz.com
```

## Credits

- [@pavelbinar](https://github.com/pavelbinar) for QA and not just that.
