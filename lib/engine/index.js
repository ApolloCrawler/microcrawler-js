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
        'cheerio',
        'deferred',
        'events',
        'fs',
        'minimist',
        'moment',
        'path',
        'util'
    ];

    define(deps, function(cheerio, deferred, Events, fs, minimist, moment, path, util) {
        var Helpers = require('../helpers'),
            logger = require('../logger');
        /**
         * Microcrawler engine implementation
         * @param opts Optional options
         * @returns {Engine}
         * @constructor
         */
        function Engine(opts) {
            this.opts = opts || Engine.defaultOptions;

            this.pubSub = new this.opts.PubSub(this.opts.PubSubOpts || {});

            this.queue = new this.opts.Queue(this.opts.QueueOpts || {});

            this.processors = {};

            this.stats = {

            };

            return this;
        }

        util.inherits(Engine, Events.EventEmitter);

        Engine.defaultOptions = {
            Logger: require('./../logger'),
            LoggerOpts: {},

            PubSub: require('./../pubSub/pubSubFaye.js'),
            PubSubOpts: {
                root: '/',
                port: 8000
            },

            Queue: require('./../queues/queueMemory'),
            QueueOpts: null

            // TODO: Add more default options here
        };

        /**
         * Gets statistics about engine
         * @returns {{queue: {requested: *, processing: *, done: *, failed: *}}}
         */
        Engine.prototype.getStats = function() {
            var mem = process.memoryUsage();

            var now = moment();

            var queue = {
                requested: this.queue.count('requested'),
                processing: this.queue.count('processing'),
                done: this.queue.count('done'),
                failed: this.queue.count('failed')
            };
            var totalCount = queue.requested + queue.processing + queue.done + queue.failed;

            var time = {
                startedAt: this.stats.startTime,
                now: now,
                elapsed: (now - this.stats.startTime) * 0.001
            };

            var res = {
                mem: mem,
                queue: queue,
                speed: {
                    requested: queue.requested / time.elapsed,
                    processing: queue.processing / time.elapsed,
                    done: queue.done / time.elapsed,
                    failed: queue.failed / time.elapsed,
                    overall: totalCount / time.elapsed
                },
                time: time
            };

            return res;
        };

        /**
         * Initializes async parts of engine
         * @returns {*} Promise
         */
        Engine.prototype.init = function() {
            return this.pubSub.init();
        };

        /**
         * Loads one processor specified by full path from directory of processors
         * @param pathDir Directory with processors (used for calculating relative path)
         * @param fullPath Full path to processor to be loaded
         * @returns {{name: (XML|string), path: *, processor: (Object|*)}}
         */
        Engine.prototype.loadProcessor = function(pathDir, fullPath) {
            var name = path.relative(pathDir, fullPath)
                .replace(path.extname(fullPath), '')
                .replace(path.sep, '.');

            this.registerProcessor(name, require(fullPath));

            return {
                name: name,
                path: fullPath,
                processor: require(fullPath)
            };
        };

        /**
         * Loads and register processor from path (dir)
         *
         * The name of processor is generated in following way:
         *
         * * The extension is stripped
         * * path.sep is converted to dot ('.')
         *
         * Example filename to processor name transformation:
         *
         * 'google/listing.js' -> 'google.listing'
         *
         * @param pathDir Dir with processors (each in own folder) to be loaded
         * @returns {*} Promise
         */
        Engine.prototype.loadProcessors = function(pathDir) {
            var d = deferred();

            var self = this;
            Helpers.walk(pathDir, function(err, results) {
                if (err) {
                    d.reject(err);
                }

                var processors = [];

                for(var i = 0; i < results.length; i++) {
                    var fullPath = results[i];
                    var proc = self.loadProcessor(pathDir, fullPath);
                    processors.push(proc);
                }

                d.resolve(processors);
            });

            return d.promise();
        };

        /**
         * Main CLI function
         *
         * Workflow is following:
         *
         * * Parse CLI arguments
         * * Process requested URLS
         *
         * @returns {*} Promise which is resolved when all work is done
         */
        Engine.prototype.main = function(passedArgv) {
            if(!passedArgv) {
                passedArgv = process.argv.slice(2);
            }
            var argv = minimist(passedArgv);

            if(argv.l) {
                var loadPaths = null;
                if(Object.prototype.toString.call(argv.l) !== '[object Array]') {
                    loadPaths = [argv.l];
                } else {
                    loadPaths = argv.l;
                }

                logger.info("Loading processors from following paths - '" + loadPaths + "'");
                for(var i = 0; i < loadPaths.length; i++) {
                    this.loadProcessors(path.resolve(loadPaths[i]));
                }
            }

            for(var j = 0; j < argv._.length; j++) {
                var url = argv._[j];

                this.enqueueUrl({
                    url: url,
                    processor: argv.p
                });
            }

            // Now just launch the engine and wait for results
            return this.run();
        };

        Engine.prototype.registerProcessor = function(name, processor) {
            if(!name) {
                throw new TypeError('name must be specified');
            }

            this.processors[name] = processor;
            return processor;
        };

        /**
         * Process this.queue.requested urls
         *
         * It means following:
         *
         * * Iterate over all this.queue.requested.items
         * * Remove from this.queue.requested
         * * processRequested() each of them - will add item to this.queue.processing
         *
         * @returns {number} Number of processed items
         */
        Engine.prototype.process = function() {
            var processed = 0;

            var item = this.getNextRequested();
            while(item) {
                this.processRequested(item);
                processed++;

                item = this.getNextRequested();
            }

            return processed;
        };

        /**
         * Processes one requested URL/item
         *
         * It means following:
         *
         * * Push to this.queue.processing
         * * Do deferred HTTP request of item.url and than
         * * Load data to cheerio
         * * Call processor specified (ie, yelp.details)
         * * this.processFinishedResults()
         * * this.finishRequestedItem() - move from this.queue.processing -> this.queue.done
         *
         * @param item Item requested to be processed
         */
        Engine.prototype.processRequested = function(item) {
            this.addProcessing(item);

            var self = this;
            Helpers.Request.request(item.url).then(function(data) {
                var doc = cheerio.load(data);
                var res = self.processors[item.processor](doc, item);
                self.processFinishedResults(res);
                self.finishRequested(item);
            }).done(function(res) {

            }, function(err) {
                logger.error('' + err);
            });
        };

        /**
         * Processes results returned by registered and used page processor
         *
         * It means following:
         *
         * * All results are iterated
         * * Results of {type: 'url'} are queued (behavior depends on Queue.enqueueUrl() implementation
         * * Results of {type: 'data'} are emitted using EventEmitter
         *
         * @param results Results to be processed
         */
        Engine.prototype.processFinishedResults = function(results) {
            for(var i = 0; i < results.length; i++) {
                var result = results[i];
                if(result.type === 'data') {
                    this.emit('data', result);
                } else if(result.type === 'url') {
                    this.enqueueUrl({
                        url: result.url,
                        processor: result.processor,
                        data: result.data
                    });
                }
            }
        };

        /**
         * Kick of first tick and keep running until necessary
         *
         * @returns {*} Promise to be resolved when done
         */
        Engine.prototype.run = function() {
            var d = deferred();

            if(!this.stats.startTime) {
                this.stats.startTime = moment();
            }

            this.scheduleTick(d);

            return d.promise();
        };

        /**
         * Schedule next tick
         * @param d Promise to be passed to tick function
         */
        Engine.prototype.scheduleTick = function(d) {
            var self = this;
            setTimeout(function() {
                self.tick(d);
            }, 10);
        };

        /**
         * Performs one engine tick
         *
         * It means following:
         *
         * * Check if everything isCrawlingDone()
         * * Resolves promise if done
         * * Schedules next processing tick if not done
         *
         *  @param d Promise
         */
        Engine.prototype.tick = function(d) {
            this.process();

            if(this.isCrawlingDone()) {
                this.pubSub.stop();
                d.resolve(true);
            } else {
                this.scheduleTick(d);
            }
        };

        /**
         * Enqueue new URL and specify processor to parse page (and optionally the data passed)
         *
         * Procedure is following:
         *
         * * Checks if wasAlreadyEnqueued() and returns if co
         * * Generates boxing structure wih following info
         *   * guid - generated using Helpers.guid()
         *   * url - url to be processed
         *   * processor - name of previously registered processor to parse results
         *
         * @param item Item to be queued
         * @returns {boolean} True if newly queued, false if already queued (or processing, done, failed ...)
         */
        Engine.prototype.enqueueUrl = function(item) {
            if(this.wasAlreadyEnqueued(item)) {
                logger.info('Item ALREADY queued: ' + JSON.stringify(item, null, 4));
                return false;
            }

            if(!item.guid) {
                item.guid = Helpers.guid();
            }

            var res = this.queue.put(item, 'requested') !== null;

            if(res) {
                logger.info('Item NEWLY queued: ' + JSON.stringify(item, null, 4));
            } else {
                logger.info('Item FAILED to be queued: ' + JSON.stringify(item, null, 4));
            }

            return res;
        };

        /**
         * Process finished request
         *
         * It means following:
         *
         * * Remove item from this.queue.processing
         * * Add item to this.queue.done
         *
         * @param item Item to be moved from this.queue.processing to this.queue.done
         * @returns {boolean} True if the move happened
         */
        Engine.prototype.finishRequested = function(item) {
            return this.queue.move(item, 'processing', 'done');
        };

        /**
         * Returns true if all request were processed
         *
         * It means following:
         *
         * * this.queue.requested is empty
         * * this.queue.processing is empty
         *
         * TODO: Decide how to handle failed items
         *
         * @returns {boolean} True if everything was processed
         */
        Engine.prototype.isCrawlingDone = function () {
            return this.queue.count('requested') === 0 &&
                this.queue.count('processing') === 0;
        };

        Engine.prototype.getNextRequested = function() {
            return this.queue.get('requested');
        };

        Engine.prototype.addProcessing = function(item) {
            return this.queue.put(item, 'processing');
        };

        /**
         * Checks if specified combination of url and processor was already enqueued
         * @param url Url to be queued
         * @param processor Processor to be used for processing url
         * @returns {boolean} True if already queued (or processing, or done or failed)
         */
        Engine.prototype.wasAlreadyEnqueued = function(item) {
            var queues = [
                'requested',
                'processing',
                'done',
                'failed'
            ];

            return this.queue.exist(item, queues);
        };

        // Export Engine
        module.exports = Engine;
    });
}());
