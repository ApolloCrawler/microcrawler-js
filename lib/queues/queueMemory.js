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
        'util',
        '../helpers'
    ];

    define(deps, function(util, Helpers) {
        var QueueBase = require('./queueBase');

        /**
         * In memory queue implementation
         * @param opts Optional options
         * @returns {QueueMemory}
         * @constructor
         */
        function QueueMemory(opts) {
            opts = opts || {};

            this.queue = {
                requested: [],
                processing: [],
                done: [],
                failed: []
            };

            return this;
        }

        util.inherits(QueueMemory, QueueBase);

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
        QueueMemory.prototype.enqueueUrl = function(url, processor, data) {
            if(this.wasAlreadyEnqueued(url, processor)) {
                return false;
            }

            /*
            if(Object.prototype.toString.call(url) !== '[object Array]') {
            }
            //*/

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
        QueueMemory.prototype.finishRequested = function(item) {
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
        QueueMemory.prototype.isDone = function() {
            return this.queue.requested.length === 0 &&
                this.queue.processing.length === 0;
        };

        QueueMemory.prototype.getNextRequested = function() {
            // TODO: This must be 'atomic'
            if(this.queue.requested.length > 0) {
                var item = this.queue.requested.shift();
                return item;
            }

            return null;
        };

        QueueMemory.prototype.addProcessing = function(item) {
            this.queue.processing.push(item);
        };

        /**
         * Checks if specified combination of url and processor was already enqueued
         * @param url Url to be enqueued
         * @param processor Processor to be used for processing url
         * @returns {boolean} True if already enqueued (or processing, or done ..)
         */
        QueueMemory.prototype.wasAlreadyEnqueued = function(url, processor) {
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

        module.exports = QueueMemory;
    });
}());