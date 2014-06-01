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
        'deepmerge',
        'deferred',
        'events',
        'fs',
        'minimist',
        'moment',
        'path',
        'util'
    ];

    define(deps, function (cheerio, merge, deferred, Events, fs, minimist, moment, path, util) {
        var Helpers = require('../../helper'),
            logger = require('../../logger');
        /**
         * Microcrawler engine implementation
         * @param opts Optional options
         * @returns {Engine}
         * @constructor
         */
        function EngineGt(opts) {
            // TODO: Merge with default options
            if(!opts) {
                opts = {};
            }

            this.opts = merge(EngineGt.defaultOptions, opts);

            return this;
        }

        EngineGt.defaultOptions = {
            workerClass: require('../../worker')
        };

        EngineGt.prototype.cleanup = function() {
            return deferred(this);
        };

        EngineGt.prototype.init = function(opts) {
            // TODO: Merge with constructor options
            if(!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            return deferred(this);
        };

        EngineGt.prototype.run = function(opts) {
            if(!opts) {
                opts = {};
            }

            return deferred(this);
        };

        // Export Engine
        module.exports = EngineGt;
    });

}());