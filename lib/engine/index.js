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
        '../request'
    ];

    define(deps, function(cheerio, deferred, Request) {
        function guid() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

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

        Engine.defaultOptions = {
            // TODO: Add more default options here
        };

        Engine.prototype.enqueueUrl = function(url, processor) {
            var proc = null;

            if (typeof processor === 'string') {
                proc = this.processors[processor];
            } else if(typeof processor === 'Function') {
                proc = processor;
            }

            this.queue.requested.push({
                guid: guid(),
                url: url,
                processor: proc
            });
        };

        Engine.prototype.finishRequested = function(item) {
            for(var i = 0; i < this.queue.processing.length; i++) {
                var tmp = this.queue.processing[i];
                if(tmp.guid !== item.guid) {
                    continue;
                }

                this.queue.processing.splice(i, 1);
                this.queue.done.push(item);
                break;
            }
        };

        Engine.prototype.isDone = function() {
            return this.queue.requested.length == 0 &&
                this.queue.processing.length == 0;
        };

        Engine.prototype.registerProcessor = function(name, processor) {
            if(!name) {
                throw new TypeError('name must be specified');
            }

            this.processors[name] = processor;
            return processor;
        };

        Engine.prototype.process = function() {
            if(this.queue.requested.length > 0) {
                var item = this.queue.requested.shift();

                this.queue.processing.push(item);

                var self = this;
                Request.request(item.url).then(function(data) {
                    var doc = cheerio.load(data);
                    var res = item.processor(doc);
                    self.finishRequested(item);
                }).done(function() {

                }, function(err) {
                    console.log("ERROR: " + err);
                });
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
            }, 1000);
        };

        Engine.prototype.tick = function(d) {
            this.process();

            if(this.isDone()) {
                d.resolve(true);
            } else {
                this.scheduleTick(d);
            }
        };

        module.exports = Engine;
    });
}());
