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
   --elasticsearch-host    Address of elasticsearch server  [localhost:9200]
   -d, --directory         Directory with processors  [/Users/tomaskorcak/dev/microcrawler/examples]
   -f, --flush             Flush existing queue  [false]
   -n, --num-connections   Max count of parallel requests  [10]
   -o, --output            Print crawled data  [true]
   -p, --processor         Processor to be used for URLs
   --queue-file            Path where to store SQLite data  [queue.db]
   -q, --queue-name        Queue name (SQLite Table name)  [queue]
   -r, --rest              Start Web Interface  [false]
   --rest-port             Web Interface port  [3000]
   -s, --stats             Shows statistics  [false]
   -i, --stats-interval    Interval between printing statistics  [10]
   -v, --version           print version and exit

```

## Full Example

### Pull elasticsearch

```
$ ./scripts/pull.sh
Pulling repository elasticsearch
35f93b783f17: Download complete
....
38b5f5bc9271: Download complete
Status: Image is up to date for elasticsearch:latest
```

### Start elasticsearch

```
$ ./scripts/run.sh
d5b0de6bc84f92cc7fc98da2d8e839c8f3886d5fa779d3fdc96e41b6945e5867
```

### Crawl xkcd, store data in elasticsearch

```
node app.js -p xkcd.listing -e http://xkcd.com

2015-05-30T12:03:14.390Z - info: ARGV: undefined
2015-05-30T12:03:14.393Z - info: OPTS: {
    "0": "http://xkcd.com",
    "processor": "xkcd.listing",
    "elasticsearch": true,
    "_": [
        "http://xkcd.com"
    ],
    "elasticsearch-host": "localhost:9200",
    "directory": "/Users/tomaskorcak/dev/microcrawler/examples",
    "flush": false,
    "num-connections": 10,
    "output": true,
    "queue-file": "queue.db",
    "queue-name": "queue",
    "rest": false,
    "rest-port": 3000,
    "stats": false,
    "stats-interval": 10
}
2015-05-30T12:03:14.395Z - info: Loading example processors - '/Users/tomaskorcak/dev/microcrawler/examples'
2015-05-30T12:03:14.433Z - info: Engine Initialized
2015-05-30T12:03:14.433Z - info: Application initialized.
2015-05-30T12:03:14.434Z - info: Loading processors from following paths - '/Users/tomaskorcak/dev/microcrawler/examples'
2015-05-30T12:03:14.438Z - info: Item NEWLY queued: {
    "url": "http://xkcd.com",
    "processor": "xkcd.listing",
    "guid": "46c5baeb-13c6-9c24-2b27-5650f0589168"
}

...

2015-05-30T12:10:09.894Z - info: Engine cleanup done.
2015-05-30T12:10:09.895Z - info: Application cleanup done.
2015-05-30T12:10:09.895Z - info: Crawling Done, processed 2555 items.
```

### Query elasticsearch

```
http://localhost:9200/_search?q=wikipedia


{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 29,
    "max_score": 0.9647289,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuYTdf7k4d9ydehVb",
        "_score": 0.9647289,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg",
          "title": "Maybe someday I'll get to write the Wikipedia article about this place!  Wait, damn, original research.",
          "alt": "Choices: Part 2",
          "listingUrl": "http:\/\/xkcd.com\/265\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuF_jf7k4d9ydehOI",
        "_score": 0.9614518,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/simple.png",
          "title": "Actually, I think if all higher math professors had to write for the Simple English Wikipedia for a year, we'd be in much better shape academically.",
          "alt": "Simple",
          "listingUrl": "http:\/\/xkcd.com\/547\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/simple.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kub30f7k4d9ydehXF",
        "_score": 0.91683316,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/the_problem_with_wikipedia.png",
          "title": "'Taft in a wet t-shirt contest' is the key image here.",
          "alt": "The Problem with Wikipedia",
          "listingUrl": "http:\/\/xkcd.com\/214\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/the_problem_with_wikipedia.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuMRff7k4d9ydehQs",
        "_score": 0.875524,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/impostor.png",
          "title": "If you think this is too hard on literary criticism, read the Wikipedia article on deconstruction.",
          "alt": "Impostor",
          "listingUrl": "http:\/\/xkcd.com\/451\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/impostor.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2ktvqpf7k4d9ydehE5",
        "_score": 0.7717831,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/extended_mind.png",
          "title": "Wikipedia trivia: if you take any article, click on the first link in the article text not in parentheses or italics, and then repeat, you will eventually end up at \"Philosophy\".",
          "alt": "Extended Mind",
          "listingUrl": "http:\/\/xkcd.com\/903\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/extended_mind.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2ktvqpf7k4d9ydehE6",
        "_score": 0.76916146,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/extended_mind.png",
          "title": "Wikipedia trivia: if you take any article, click on the first link in the article text not in parentheses or italics, and then repeat, you will eventually end up at \"Philosophy\".",
          "alt": "Extended Mind",
          "listingUrl": "http:\/\/xkcd.com\/903\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/extended_mind.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2ktv90f7k4d9ydehFP",
        "_score": 0.7640276,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/number_line.png",
          "title": "The Wikipedia page \"List of Numbers\" opens with \"This list is incomplete; you can help by expanding it.\"",
          "alt": "Number Line",
          "listingUrl": "http:\/\/xkcd.com\/899\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/number_line.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuApVf7k4d9ydehL4",
        "_score": 0.7640276,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/anatomy_text.png",
          "title": "For many of the anatomy pictures on Wikipedia, I think this is actually not far from reality. They only look all formal and professional due to careful cropping.",
          "alt": "Anatomy Text",
          "listingUrl": "http:\/\/xkcd.com\/631\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/anatomy_text.png"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuYTwf7k4d9ydehVc",
        "_score": 0.7640276,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg",
          "title": "Maybe someday I'll get to write the Wikipedia article about this place!  Wait, damn, original research.",
          "alt": "Choices: Part 2",
          "listingUrl": "http:\/\/xkcd.com\/265\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg"
          ],
          "processor": "xkcd.listing"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "AU2kuYULf7k4d9ydehVe",
        "_score": 0.7640276,
        "_source": {
          "url": "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg",
          "title": "Maybe someday I'll get to write the Wikipedia article about this place!  Wait, damn, original research.",
          "alt": "Choices: Part 2",
          "listingUrl": "http:\/\/xkcd.com\/265\/",
          "thumbnails": [
            "\/\/imgs.xkcd.com\/comics\/choices_part_2.jpg"
          ],
          "processor": "xkcd.listing"
        }
      }
    ]
  }
}

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
