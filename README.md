# microcrawler

## Status

[![GitHub version](https://badge.fury.io/gh/korczis%2Fmicrocrawler.png)](http://badge.fury.io/gh/korczis%2Fmicrocrawler)
[![Dependency Status](https://gemnasium.com/korczis/microcrawler.svg)](https://gemnasium.com/korczis/microcrawler)
[![Code Climate](https://codeclimate.com/github/korczis/microcrawler.png)](https://codeclimate.com/github/korczis/microcrawler)
[![Coverage Status](https://coveralls.io/repos/korczis/microcrawler/badge.png)](https://coveralls.io/r/korczis/microcrawler)
[![Build Status](https://travis-ci.org/korczis/microcrawler.png)](https://travis-ci.org/korczis/microcrawler)

## Example usage

### Craiglist

```
node app.js -p craiglist.listing http://sfbay.craigslist.org/sfc/sss/
```

### Google

```
node app.js -p google.listing "https://www.google.com/search?q=test"
```

### Yelp

```
node app.js -p yelp.listing "http://www.yelp.com/search?find_desc=restaurants&find_loc=Los+Angeles%2C+CA&ns=1&ls=f4de31e623458437"
```

### Youjizz

```
node app.js -p youjizz.listing http://youjizz.com
```

### xkcd

```
node app.js -p xkcd.listing http://xkcd.com
```
