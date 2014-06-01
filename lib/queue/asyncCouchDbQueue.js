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
        'util'
    ];

    define(deps, function(util) {
        var QueueBase = require('./queueBase'),
            Helpers = require('../helper');

        /**
         * In memory queue implementation
         * @param opts Optional options
         * @returns {QueueCouchDb}
         * @constructor
         */
        function QueueCouchDb(opts) {
            opts = opts || {};

            this.queue = {
                requested: [],
                processing: [],
                done: [],
                failed: []
            };

            return this;
        }

        util.inherits(QueueCouchDb, QueueBase);

        /**
         * Get count of items in queue
         * @param queue object or name
         */
        QueueCouchDb.prototype.count = function(queue) {
//            return this.queue[queue].length;
        };

        /**
         * Checks if item exists in queue
         * @param queue object or name
         */
        QueueCouchDb.prototype.exist = function(item, queue) {
//            var res = this.find(item, queue);
//            return res !== undefined && res !== null;
        };

        /**
         *
         * @param item Item to be found
         * @param {(string | string[])} queue Queue to look in
         * @returns {*} Item if found, null elsewhere
         */
        QueueCouchDb.prototype.find = function(item, queue, remove) {
//            var lookIn = [];
//
//            if(Object.prototype.toString.call(queue) !== '[object Array]') {
//                lookIn = [queue];
//            } else {
//                lookIn = queue;
//            }
//
//            for(var i = 0; i < lookIn.length; i++) {
//                var queueTmpName = lookIn[i];
//                var queueTmp = this.queue[queueTmpName];
//
//                for(var j = 0; j < queueTmp.length; j++) {
//                    var element = queueTmp[j];
//                    if((element.guid === item.guid) || element.url === item.url && element.processor === item.processor) {
//
//                        if(remove) {
//                            queueTmp.splice(j, 1);
//                        }
//
//                        return element;
//                    }
//                }
//            }
//
//            return null;
        };

        /**
         * Get item from queue, queue can be object or name
         * @param queue
         */
        QueueCouchDb.prototype.get = function(queue) {
//            if(this.queue[queue].length < 1) {
//                return null;
//            }
//
//            return this.queue[queue].shift();
        };

        /**
         * Move item from 'fromQueue' to 'toQueue'
         * @param item
         * @param from
         * @param to
         */
        QueueCouchDb.prototype.move = function(item, from, to) {
//            var res = this.find(item, from, true);
//
//            if(res) {
//                return this.put(res, to);
//            }
//
//            return null;
        };

        /**
         * Put item to queue specified
         * @param queue Object or name
         * @param item
         */
        QueueCouchDb.prototype.put = function(item, queue) {
//            if(!item.guid) {
//                item.guid = Helpers.guid();
//            }
//
//            var length = this.queue[queue].length;
//            if((this.queue[queue].push(item) - length) === 1) {
//                return item;
//            }
//
//            return null;
        };

        module.exports = QueueCouchDb;
    });
}());