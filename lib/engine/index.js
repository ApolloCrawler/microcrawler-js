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
        'path',
        'util',
        '../helpers',
        '../request'
    ];

    define(deps, function(cheerio, deferred, Events, fs, minimist, path, util, Helpers, Request) {

        /**
         * Engine Class
         * @class
         */
        function Engine(opts) {
            this.opts = opts || Engine.defaultOptions;

            this.queue = {
                requested: [],
                processing: [],
                done: [],
                failed: []
            };

            this.processors = {};
        }

        util.inherits(Engine, Events.EventEmitter);

        Engine.defaultOptions = {
            // TODO: Add more default options here
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
         * @param url Url to be enqueued
         * @param processor Name of processor to be used for processing result page
         * @param data Optional data to pass to processor
         * @returns {boolean} True if newly queued, false if already queued (or processing, done, failed ...)
         */
        Engine.prototype.enqueueUrl = function(url, processor, data) {
            if(this.wasAlreadyEnqueued(url, processor)) {
                return false;
            }

            var item = {
                guid: Helpers.guid(),
                url: url,
                processor: processor
            };

            if(data) {
                item.data = data;
            }

            this.queue.requested.push(item);
            return true;
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
            for(var i = 0; i < this.queue.processing.length; i++) {
                var tmp = this.queue.processing[i];
                if(tmp.guid !== item.guid) {
                    continue;
                }

                this.queue.processing.splice(i, 1);
                this.queue.done.push(item);
                return true;
            }

            return false;
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
        Engine.prototype.isDone = function() {
            return this.queue.requested.length === 0 &&
                this.queue.processing.length === 0;
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
                    var name = path.relative(pathDir, fullPath)
                        .replace(path.extname(fullPath), '')
                        .replace(path.sep, '.');

                    self.registerProcessor(name, require(fullPath));

                    processors.push({
                        name: name,
                        path: fullPath,
                        processor: require(fullPath)
                    });
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
        Engine.prototype.main = function() {
            var argv = minimist(process.argv.slice(2));

            if(argv.l) {
                var loadPaths = null;
                if(Object.prototype.toString.call(argv.l) !== '[object Array]') {
                    loadPaths = [argv.l];
                } else {
                    loadPaths = argv.l;
                }

                console.log(loadPaths);
                for(var i = 0; i < loadPaths.length; i++) {
                    this.loadProcessors(path.resolve(loadPaths[i]));
                }
            }

            for(var j = 0; j < argv._.length; j++) {
                var url = argv._[j];

                this.enqueueUrl(url, argv.p, null);
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

            while(this.queue.requested.length > 0) {
                var item = this.queue.requested.shift();
                this.processRequested(item);
                processed++;
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
            this.queue.processing.push(item);

            var self = this;
            Request.request(item.url).then(function(data) {
                var doc = cheerio.load(data);
                var res = self.processors[item.processor](doc, item);
                self.processFinishedResults(res);
                self.finishRequested(item);
            }).done(function() {

            }, function(err) {
                console.log("ERROR: " + err);
            });
        };

        /**
         * Processes results returned by registered and used page processor
         *
         * It means following:
         *
         * * All results are iterated
         * * Results of {type: 'url'} are enqueued if not wasAlreadyEnqueued()
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
                    this.enqueueUrl(result.url, result.processor, result.data);
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
         * * Check if everything isDone()
         * * Resolves promise if done
         * * Schedules next processing tick if not done
         *
         *  @param d Promise
         */
        Engine.prototype.tick = function(d) {
            this.process();

            if(this.isDone()) {
                d.resolve(true);
            } else {
                this.scheduleTick(d);
            }
        };

        /**
         * Checks if specified combination of url and processor was already enqueued
         * @param url Url to be enqueued
         * @param processor Processor to be used for processing url
         * @returns {boolean} True if already enqueued (or processing, or done ..)
         */
        Engine.prototype.wasAlreadyEnqueued = function(url, processor) {
            var queues = [
                this.queue.requested,
                this.queue.processing,
                this.queue.done,
                this.queue.failed
            ];

            // TODO: This is *VERY* naive implementation with unnecessary O(n) complexity
            //       It will be much better if there will be some parallel and synchronized
            //       container with better access complexity. Not important for now. (21/4/2014)
            for(var i = 0; i < queues.length; i++) {
                var queue = queues[i];
                for(var j = 0; j < queue.length; j++) {
                    var item = queue[j];
                    if(item.url === url && item.processor === processor) {
                        return true;
                    }
                }
            }

            return false;
        };

        // Export Engine
        module.exports = Engine;
    });
}());
