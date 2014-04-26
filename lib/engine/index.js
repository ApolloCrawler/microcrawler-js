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

            this.queue = new this.opts.Queue(this.opts.QueueOpts || {});

            this.processors = {};
        }

        util.inherits(Engine, Events.EventEmitter);

        Engine.defaultOptions = {
            Queue: require('./../queues/memory'),
            QueueOpts: {}

            // TODO: Add more default options here
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

                console.log(loadPaths);
                for(var i = 0; i < loadPaths.length; i++) {
                    this.loadProcessors(path.resolve(loadPaths[i]));
                }
            }

            for(var j = 0; j < argv._.length; j++) {
                var url = argv._[j];

                this.queue.enqueueUrl(url, argv.p, null);
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

            var item = this.queue.getNextRequested();
            while(item) {
                this.processRequested(item);
                processed++;

                item = this.queue.getNextRequested();
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
            this.queue.addProcessing(item);

            var self = this;
            Request.request(item.url).then(function(data) {
                var doc = cheerio.load(data);
                var res = self.processors[item.processor](doc, item);
                self.processFinishedResults(res);
                self.queue.finishRequested(item);
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
                    this.queue.enqueueUrl(result.url, result.processor, result.data);
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

            if(this.queue.isDone()) {
                d.resolve(true);
            } else {
                this.scheduleTick(d);
            }
        };

        // Export Engine
        module.exports = Engine;
    });
}());
