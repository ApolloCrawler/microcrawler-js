# microcrawler

## Status

[![npm version](https://badge.fury.io/js/microcrawler.svg)](https://badge.fury.io/js/microcrawler)
[![Dependency Status](https://gemnasium.com/badges/github.com/ApolloCrawler/microcrawler.svg)](https://gemnasium.com/github.com/ApolloCrawler/microcrawler)
[![Code Climate](https://codeclimate.com/github/korczis/microcrawler.png)](https://codeclimate.com/github/korczis/microcrawler)
[![Coverage Status](https://coveralls.io/repos/github/ApolloCrawler/microcrawler/badge.svg?branch=master)](https://coveralls.io/github/ApolloCrawler/microcrawler?branch=master)
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

- [node.js 4+](http://nodejs.org/)
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

### Show available commands

```
$ microcrawler

  Usage: microcrawler [options] [command]


  Commands:

    collector [args]  Run data collector
    config [args]     Run config
    exporter [args]   Run data exporter
    worker [args]     Run crawler worker
    crawl [args]      Crawl specified site
    help [cmd]        display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

### Check microcrawler version

```
$ microcrawler --version
0.1.27
```

### Initialize config file

```
$ microcrawler config init
2016-09-03T10:45:13.105Z - info: Creating config file "/Users/tomaskorcak/.microcrawler/config.json"
{
    "client": "superagent",
    "timeout": 10000,
    "throttler": {
        "enabled": false,
        "active": true,
        "rate": 20,
        "ratePer": 1000,
        "concurrent": 8
    },
    "retry": {
        "count": 2
    },
    "headers": {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "From": "googlebot(at)googlebot.com"
    },
    "proxy": {
        "enabled": false,
        "list": [
            "https://168.63.20.19:8145"
        ]
    },
    "natFaker": {
        "enabled": true,
        "base": "192.168.1.1",
        "bits": 16
    },
    "amqp": {
        "uri": "amqp://localhost",
        "queues": {
            "collector": "collector",
            "worker": "worker"
        },
        "options": {
            "heartbeat": 60
        }
    },
    "couchbase": {
        "uri": "couchbase://localhost:8091",
        "bucket": "microcrawler",
        "username": "Administrator",
        "password": "Administrator",
        "connectionTimeout": 60000000,
        "durabilityTimeout": 60000000,
        "managementTimeout": 60000000,
        "nodeConnectionTimeout": 10000000,
        "operationTimeout": 10000000,
        "viewTimeout": 10000000
    },
    "elasticsearch": {
        "uri": "localhost:9200",
        "index": "microcrawler",
        "log": "debug"
    }
}
```

### Edit config file

```
$ vim ~/.microcrawler/config.json
```

### Show config file

```
$ microcrawler config show
{
    "client": "superagent",
    "timeout": 10000,
    "throttler": {
        "enabled": false,
        "active": true,
        "rate": 20,
        "ratePer": 1000,
        "concurrent": 8
    },
    "retry": {
        "count": 2
    },
    "headers": {
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "From": "googlebot(at)googlebot.com"
    },
    "proxy": {
        "enabled": false,
        "list": [
            "https://168.63.20.19:8145"
        ]
    },
    "natFaker": {
        "enabled": true,
        "base": "192.168.1.1",
        "bits": 16
    },
    "amqp": {
        "uri": "amqp://example.com",
        "queues": {
            "collector": "collector",
            "worker": "worker"
        },
        "options": {
            "heartbeat": 60
        }
    },
    "couchbase": {
        "uri": "couchbase://example.com:8091",
        "bucket": "microcrawler",
        "username": "Administrator",
        "password": "Administrator",
        "connectionTimeout": 60000000,
        "durabilityTimeout": 60000000,
        "managementTimeout": 60000000,
        "nodeConnectionTimeout": 10000000,
        "operationTimeout": 10000000,
        "viewTimeout": 10000000
    },
    "elasticsearch": {
        "uri": "example.com:9200",
        "index": "microcrawler",
        "log": "debug"
    }
}
```

### Start Couchbase

TBD

### Start Elasticsearch

TBD

### Start Kibana

TBD

### Query elasticsearch

TBD

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
