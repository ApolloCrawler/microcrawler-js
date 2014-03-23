/*
 Copyright, 2013, by Tomas Korcak. <korczis@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// To install required packages just run following command
//   npm install deferred request node.extend cheerio

var deferred = require('deferred'),
    fs = require('fs'),
    merge = require('node.extend'),
    request = require('request'),
    cheerio = require('cheerio');

var deferredRequest = function (url) {
    var d = deferred();

    options = {
        url: url,
        headers: {
            'Accept': '*/*',
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'From': 'googlebot(at)googlebot.com'
        }
    };

    // console.log("deferredRequest('" + url + "');")

    request(options, function (err, resp, body) {
        if (err) {
            d.reject(new Error("Unable to fetch '" + url + "', reason: " + err));
            return;
        }

        if (resp.statusCode !== 200) {
            d.reject(new Error("Unable to fetch '" + url + "', code: " + resp.statusCode));
            return;
        }

        d.resolve(body);
    });

    return d.promise();
};

var maxConcurrencyLimit = 10;
var deferredLimitedRequest = deferred.gate(function async(url) {
    return deferredRequest(url);
}, maxConcurrencyLimit);

var queues = {
    requested: [],
    processing: [],
    processed: [],
    failed: []
};

////////////////////
// Example usage
////////////////////
var processPage = deferred.gate(function async(item) {
    queues.processing.push(item);

    return deferredLimitedRequest(item.url).then(function (data) {
        // Load HTML to cheerio
        var $ = cheerio.load(data);

        // Prepare results array
        var result = [];

        // Process pagination first
        $('#pagination > a').each(function (e) {
            var url = "http://youjizz.com" + this.attr('href');
            enqueueUrl(url);
        });

        // Process results
        $('#miniatura').each(function(e) {
            var title1 = this.find('span#title1')[0].children[0].data;
            var url = this.find('a').attr('href');
            var duration = this.find('span.thumbtime span')[0].children[0].data;
            var views = parseInt(this.find('span.thumbviews span')[0].children[0].data);

            var imgs = [];
            this.find('img.lazy').each(function(img) {
                imgs.push(this.attr('data-original'));
            });

            var res = {
                title: title1,
                duration: duration,
                url: "http://youjizz.com" + url,
                imgs: imgs,
                views: views
            }

            result.push(res);
        });

        for (var i = 0; i < queues.processing.length; i++) {
            if (queues.processing[i].url == item.url) {
                queues.processing.splice(i, 1);
                break;
            }
        }

        queues.processed.push(item);

        // Create immediately resolved promise and resolve it with result
        return deferred(result);

    }).done(function (res) {
            // THIS BLOCK IS NEXT HANDLER (see previous block)

            console.log(JSON.stringify(res, null, 4));
            console.log(JSON.stringify({
                requested: queues.requested.length,
                processing: queues.processing.length,
                processed: queues.processed.length,
                failed: queues.failed.length
            }, null, 4));
        }, function (err) {
            console.log("ERROR: " + err);
        });
});

var enqueueUrl = function(url) {
    for (var i = 0; i < queues.requested; i++) {
        if (queues.requested[i].url == url) {
            return;
        }
    }

    for (var i = 0; i < queues.processing; i++) {
        if (queues.processing[i].url == url) {
            return;
        }
    }

    for (var i = 0; i < queues.processed; i++) {
        if (queues.processed[i].url == url) {
            return;
        }
    }

    for (var i = 0; i < queues.failed; i++) {
        if (queues.failed[i].url == url) {
            return;
        }
    }

    queues.requested.push({
        url: url
    });
};

enqueueUrl("http://youjizz.com");

// Set tick function - periodically check for new urls queued and wait for finish of all requests
var tick = function() {
    while(queues.requested.length > 0) {
        var item = queues.requested.shift();
        processPage(item);
    }

    if(queues.processing.length > 0) {
        setTimeout(tick, 50);
    }
};

// Init
var nano = require('nano')('http://localhost:5984');
nano.db.create('microcrawler');
var db = nano.db.use('microcrawler');

// Do a first tick
tick();