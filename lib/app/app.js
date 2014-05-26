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
            stats: {
                enabled: false,
                interval: 1
            }
        };

        App.prototype.cleanup = function() {
            var d = deferred();

            if(this.opts.stats.enabled && this.stats) {
                this.printStats();
                clearInterval(this.stats);
                this.stats = null;
            }

            logger.info("Application cleanup done.");
            return d.resolve(true);
        };

        App.prototype.init = function() {
            var d = deferred();

            var self = this;
            this.engine.init().done(function() {
                logger.info("Engine Initialized");

                // Initialize options if enabled
                if(self.opts.stats.enabled) {
                    self.stats = setInterval(function() {
                        self.printStats();
                    }, self.opts.stats.interval * 1000) ;
                }

                d.resolve(true);
            });

            return d.promise();
        };

        App.prototype.processArgv = function(argv) {
            this.argv = argv || minimist(process.argv.slice(2));

            if(this.argv.s || this.argv['stats']) {
                this.opts.stats.enabled = true;
            }

            var tmp = this.argv['stats-interval'];
            if(tmp) {
                this.opts.stats.interval = parseFloat(tmp);
            }
        };

        App.prototype.printStats = function() {
            var stats = this.engine.getStats();
            logger.info('STATS: ' + JSON.stringify(stats, null, 4));
        };

        App.prototype.run = function(argv) {
            this.processArgv(argv);

            // Load example processor from files
            var processorsDir = path.join(__dirname, '../../examples');

            logger.info("Loading example processors - '" + processorsDir + "'");
            this.engine.loadProcessors(processorsDir);

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
            });

            var self = this;
            
            // Run the main function - parse args, set processor, enqueue urls specified
            this.init().then(function() {
                logger.info('Application initialized.');
                return self.engine.main();
            }).then(function() {
                return self.cleanup();
            }).done(function() {
                // Print finish message
                logger.info('Crawling Done.');
            }, function(err) {
                // This is handler of error
                logger.error('' + err);
            });
        };

        // Export App
        module.exports = App;
    });
}());