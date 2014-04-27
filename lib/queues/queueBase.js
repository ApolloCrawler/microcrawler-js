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
        '../helpers'
    ];

    define(deps, function(Helpers) {
        var CustomErrors = require('./../error');

        var notImplementedMsg = 'This must be implemented in QueueBase implementation!';

        /**
         * Base Interface for Queue Class
         * @class
         */
        function QueueBase(opts) {
            opts = opts || {};
        }

        /**
         * Get count of items in queue
         * @param queue object or name
         */
        QueueBase.prototype.count = function(queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Get item from queue, queue can be object or name
         * @param queue
         */
        QueueBase.prototype.get = function(queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Move item from 'fromQueue' to 'toQueue'
         * @param item
         * @param from
         * @param to
         */
        QueueBase.prototype.move = function(item, from, to) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        };

        /**
         * Put item to queue specified
         * @param item
         * @param queue Object or name
         */
        QueueBase.prototype.put = function(item, queue) {
            throw new CustomErrors.NotImplemented(notImplementedMsg);
        }

        module.exports = QueueBase;
    });
}());