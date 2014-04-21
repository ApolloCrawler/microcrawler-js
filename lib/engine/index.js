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
        '../request'
    ];

    define(deps, function(cheerio, deferred, Events, fs, minimist, path, util, Request) {
        var guid = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        var walk = function(dir, done) {
            var results = [];
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var i = 0;
                (function next() {
                    var file = list[i++];
                    if (!file) return done(null, results);
                    file = dir + '/' + file;
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                results = results.concat(res);
                                next();
                            });
                        } else {
                            results.push(file);
                            next();
                        }
                    });
                })();
            });
        };

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
            }

            this.processors = {};
        };

        util.inherits(Engine, Events.EventEmitter);

        Engine.defaultOptions = {
            // TODO: Add more default options here
        };

        Engine.prototype.enqueueUrl = function(url, processor, data) {
            if(this.wasAlreadyEnqueued(url, processor)) {
                return;
            };

            var item = {
                guid: guid(),
                url: url,
                processor: processor
            };

            if(data) {
                item.data = data;
            }

            this.queue.requested.push(item);
        };

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

        Engine.prototype.isDone = function() {
            return this.queue.requested.length == 0 &&
                this.queue.processing.length == 0;
        };

        Engine.prototype.loadProcessors = function(pathDir) {
            var d = deferred();

            var self = this;
            walk(pathDir, function(err, results) {
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

            for(var i = 0; i < argv._.length; i++) {
                var url = argv._[i];

                this.enqueueUrl(url, argv.p);
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

        Engine.prototype.process = function() {
            while(this.queue.requested.length > 0) {
                var item = this.queue.requested.shift();
                this.processRequested(item);
            }
        };

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

        Engine.prototype.processFinishedResults = function(results) {
            for(var i = 0; i < results.length; i++) {
                var result = results[i];
                if(result.type === 'data') {
                    this.emit('data', result);
                } else if(result.type == 'url') {
                    this.enqueueUrl(result.url, result.processor, result.data);
                }
            }
        };

        Engine.prototype.run = function() {
            var d = deferred();

            this.scheduleTick(d);

            return d.promise();
        };

        Engine.prototype.scheduleTick = function(d) {
            var self = this;
            setTimeout(function() {
                self.tick(d);
            }, 10);
        };

        Engine.prototype.tick = function(d) {
            this.process();

            if(this.isDone()) {
                d.resolve(true);
            } else {
                this.scheduleTick(d);
            }
        };

        Engine.prototype.wasAlreadyEnqueued = function(url, processor) {
            var queues = [
                this.queue.requested,
                this.queue.processing,
                this.queue.done,
                this.queue.failed
            ];

            for(var i = 0; i < queues.length; i++) {
                var queue = queues[i];
                for(var j = 0; j < queue.length; j++) {
                    var item = queue[j];
                    if(item.url == url && item.processor == processor) {
                        return true;
                    }
                }
            }

            return false;
        };

        module.exports = Engine;
    });
}());
