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
        var CustomErrors = require('../error');
        var notImplementedMsg = 'Not implemented by QueueWrapper yet!';

        var QueueBase = require('./queueBase');

        /**
         * Generic AsyncQueue Wrapper
         * @param opts Optional options
         * @returns {AsyncQueueWrapper}
         * @constructor
         */
        function AsyncQueueWrapper(opts) {
            opts = opts || {};

            this.opts = opts;

            return this;
        }

        util.inherits(AsyncQueueWrapper, QueueBase);

        /**
         * Get count of items in queue
         * @param queue object or name
         */
        AsyncQueueWrapper.prototype.count = function(queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Checks if item exists in queue
         * @param queue object or name
         */
        AsyncQueueWrapper.prototype.exist = function(item, queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         *
         * @param item Item to be found
         * @param {(string | string[])} queue Queue to look in
         * @returns {*} Item if found, null elsewhere
         */
        AsyncQueueWrapper.prototype.find = function(item, queue, remove) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Get item from queue, queue can be object or name
         * @param queue
         */
        AsyncQueueWrapper.prototype.get = function(queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Move item from 'fromQueue' to 'toQueue'
         * @param item
         * @param from
         * @param to
         */
        AsyncQueueWrapper.prototype.move = function(item, from, to) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Put item to queue specified
         * @param queue Object or name
         * @param item
         */
        AsyncQueueWrapper.prototype.put = function(item, queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        module.exports = AsyncQueueWrapper;
    });
}());