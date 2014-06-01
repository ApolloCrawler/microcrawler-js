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
        'util'
    ];

    define(deps, function(deferred, util) {
        var QueueBase = require('./queueBase'),
            Helpers = require('../helper');

        /**
         * In memory queue implementation
         * @param opts Optional options
         * @returns {AsyncMemoryQueue}
         * @constructor
         */
        function AsyncMemoryQueue(opts) {
            opts = opts || {};

            this.queue = {
                requested: [],
                processing: [],
                done: [],
                failed: []
            };

            this.opts = opts;

            return this;
        }

        util.inherits(AsyncMemoryQueue, QueueBase);

        /**
         * Get count of items in queue
         * @param queue object or name
         */
        AsyncMemoryQueue.prototype.count = function(queue) {
            return deferred(this.queue[queue].length);
        };

        /**
         * Checks if item exists in queue
         * @param queue object or name
         */
        AsyncMemoryQueue.prototype.exist = function(item, queue) {
            var d = deferred();

            this.find(item, queue).then(function(res) {
                d.resolve(res !== undefined && res !== null);
            });

            return d.promise();
        };

        /**
         *
         * @param item Item to be found
         * @param {(string | string[])} queue Queue to look in
         * @returns {*} Item if found, null elsewhere
         */
        AsyncMemoryQueue.prototype.find = function(item, queue, remove) {
            var lookIn = [];

            if(Object.prototype.toString.call(queue) !== '[object Array]') {
                lookIn = [queue];
            } else {
                lookIn = queue;
            }

            for(var i = 0; i < lookIn.length; i++) {
                var queueTmpName = lookIn[i];
                var queueTmp = this.queue[queueTmpName];

                for(var j = 0; j < queueTmp.length; j++) {
                    var element = queueTmp[j];
                    if((element.guid === item.guid) || element.url === item.url && element.processor === item.processor) {

                        if(remove) {
                            queueTmp.splice(j, 1);
                        }

                        return deferred(element);
                    }
                }
            }

            return deferred(null);
        };

        /**
         * Get item from queue, queue can be object or name
         * @param queue
         */
        AsyncMemoryQueue.prototype.get = function(queue) {
            if(this.queue[queue].length < 1) {
                return deferred(null);
            }

            return deferred(this.queue[queue].shift());
        };

        /**
         * Move item from 'fromQueue' to 'toQueue'
         * @param item
         * @param from
         * @param to
         */
        AsyncMemoryQueue.prototype.move = function(item, from, to) {
            var d = deferred();

            this.find(item, from, true).then(function(res) {
                if(res) {
                    d.resolve(this.put(res, to));
                }

                return d.resolve(null);
            });

            return d.promise();
        };

        /**
         * Put item to queue specified
         * @param queue Object or name
         * @param item
         */
        AsyncMemoryQueue.prototype.put = function(item, queue) {
            if(!item.guid) {
                item.guid = Helpers.guid();
            }

            var length = this.queue[queue].length;
            if((this.queue[queue].push(item) - length) === 1) {
                return deferred(item);
            }

            return deferred(null);
        };

        module.exports = AsyncMemoryQueue;
    });
}());