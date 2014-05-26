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

    define(deps, function (deferred, Events, minimist, path, util) {
        var Engine = require('../engine');
        var logger = require('../logger');

        function App(opts) {
            this.opts = opts || App.defaultOptions;

            this.stats = {
                items: {
                    processed: 0
                }
            };

            // First step is to create engine
            this.engine = new Engine();

            return this;
        };

        util.inherits(App, Events.EventEmitter);

        App.defaultOptions = {
            stats: {
                enabled: false,
                interval: 1
            },

            output: {
                enabled: true
            },

            couchdb: {
                enabled: false,
                uri: 'http://apollo:apollo@localhost:5984'
            }
        };

        /**
         * Cleanup application
         * @returns {*} Promise
         */
        App.prototype.cleanup = function () {
            var d = deferred();

            var self = this;
            this.engine.cleanup().done(function () {
                // Cleanup stats if needed
                if (self.opts.stats.enabled && self.statsInterval) {
                    self.printStats();
                    clearInterval(self.statsInterval);
                    self.statsInterval = null;
                }

                logger.info("Application cleanup done.");
                return d.resolve(true);
            });

            return d.promise()
        };

        /**
         * Initialize application
         * @returns {*} Promise
         */
        App.prototype.init = function () {
            var d = deferred();

            var self = this;

            // Initialize core Engine
            var res = this.engine.init().then(function () {
                logger.info("Engine Initialized");

                var d = deferred();
                return d.resolve(true);
            });

            if (this.opts.couchdb.enabled) {
                var dbName = 'microcrawler-couchappka';
                var nano = require('nano')('http://apollo:apollo@localhost:5985');

                //*
                res = res.then(function () {
                    nano.db.create(dbName, function (err, body) {
                        self.db = nano.db.use(dbName);

                        // Initialize additional data callback
                        self.engine.on('data', function (result) {
                            logger.info('DATA: ' + JSON.stringify(result, null, 4));

                            self.db.insert(result, null, function (err, body, header) {
                                if (err) {
                                    logger.error(err.message);
                                    return;
                                }
                            });
                        });

                        d.resolve();
                    });

                    return d.promise();
                });

                //*/
            }

            // Promise done handler
            res.done(function () {
                // Initialize options if enabled
                if (self.opts.stats.enabled) {
                    self.statsInterval = setInterval(function () {
                        self.printStats();
                    }, self.opts.stats.interval * 1000);
                }

                d.resolve(true);
            });

            return d.promise();
        };

        /**
         * Process ARGV
         * @param argv
         */
        App.prototype.processArgv = function (argv) {
            this.argv = argv || minimist(process.argv.slice(2));

            var tmp = this.argv.couchdb;
            if (tmp) {
                this.opts.couchdb.enabled = true;
            }

            if (this.argv.o || this.argv['output']) {
                this.opts.output.enabled = true;
            }

            if (this.argv.s || this.argv['stats']) {
                this.opts.stats.enabled = true;
            }

            tmp = this.argv['stats-interval'];
            if (tmp) {
                this.opts.stats.interval = parseFloat(tmp);
            }
        };

        /**
         * Print stats
         */
        App.prototype.printStats = function () {
            var stats = this.engine.getStats();
            logger.info('STATS: ' + JSON.stringify(stats, null, 4));
        };

        /**
         * Run application
         * @param argv Optional ARGV to be used instead of cli one
         */
        App.prototype.run = function (argv) {
            this.processArgv(argv);
            logger.info("OPTS: " + JSON.stringify(this.argv, null, 4));

            // Load example processor from files
            var processorsDir = path.join(__dirname, '../../examples');

            logger.info("Loading example processors - '" + processorsDir + "'");
            this.engine.loadProcessors(processorsDir);

            var self = this;

            // Register on data event handler
            this.engine.on('data', function (result) {
                if (self.opts.output.enabled) {
                    logger.info('DATA: ' + JSON.stringify(result, null, 4));
                }

                self.stats.items.processed += 1;
            });

            // Run the main function - parse args, set processor, enqueue urls specified
            this.init().then(function () {
                logger.info('Application initialized.');
                return self.engine.main();
            }).then(function () {
                return self.cleanup();
            }).done(function () {
                // Print finish message
                logger.info('Crawling Done, processed ' + self.stats.items.processed + ' items.');
            }, function (err) {
                // This is handler of error
                logger.error('' + err);
            });
        };

        // Export App
        module.exports = App;
    });
}());