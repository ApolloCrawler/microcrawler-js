// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(function () {
    'use strict';

    var define = require('amdefine')(module);

    /**
     * Array of modules this one depends on.
     * @type {Array}
     */
    var deps = [
        'deferred',
        'events',
        'minimist',
        'path',
        'util'
    ];

    define(deps, function(deferred, Events, minimist, path, util) {
        var Engine = require('../engine');
        var logger = require('../logger');

        function App(opts) {
            this.opts = opts || App.defaultOptions;

            // First step is to create engine
            this.engine = new Engine();

            return this;
        };

        util.inherits(App, Events.EventEmitter);

        App.defaultOptions = {

        };

        App.prototype.printStats = function() {
            var stats = this.engine.getStats();
            logger.info('STATS: ' + JSON.stringify(stats, null, 4));
        };

        App.prototype.run = function(argv) {
            if(!argv) {
                argv = minimist(process.argv.slice(2));
            }

            // Load example processor from files
            var processorsDir = path.join(__dirname, '../../examples');

            logger.info("Loading example processors - '" + processorsDir + "'");
            this.engine.loadProcessors(processorsDir);

            // Final results
            var resultsCount = 0;

            var dbName = 'microcrawler-couchapp';
            var nano = require('nano')('http://localhost:5985');
            nano.db.create(dbName);
            var db = nano.db.use(dbName);

            // Register on data event handler
            this.engine.on('data', function (result) {
                logger.info('DATA: ' + JSON.stringify(result, null, 4));

                db.insert(result, null, function(err, body, header) {
                    if (err) {
                        console.log(err.message);
                        return;
                    }
                });

                // Increment results counter
                resultsCount++;
            });

            var self = this;

            var statsInterval = null;
            var statsPrintInterval = argv.interval || 3;

            // Run the main function - parse args, set processor, enqueue urls specified
            this.engine.init().then(function() {
                logger.info('Engine initialized.');

                if(argv.s) {
                    statsInterval = setInterval(function() {
                        self.printStats();
                    }, statsPrintInterval * 1000);
                }

                return self.engine.main();
            }).done(function() {
                if(argv.s) {
                    // Print stats
                    self.printStats();

                    // Clear stats interval
                    if(statsInterval) {
                        clearInterval(statsInterval);
                        statsInterval = null;
                    }
                }

                // Print finish message
                logger.info('Crawling Done, ' + resultsCount + ' results!');
            }, function(err) {
                // This is handler of error
                logger.error('' + err);
            });
        };

        // Export App
        module.exports = App;
    });
}());