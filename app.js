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
        'path',
        './lib',
        './lib/logger'
    ];

    define(deps, function(path, Mc, logger) {
        // First step is to create engine
        var engine = new Mc.Engine();

        // Load example processor from files
        var processorsDir = path.join(__dirname, 'examples');

        logger.info("Loading example processors - '" + processorsDir + "'");
        engine.loadProcessors(processorsDir);

        // Final results
        var resultsCount = 0;

        // Register on data event handler
        engine.on('data', function (result) {
            logger.info(JSON.stringify(result, null, 4));

            // Increment results counter
            resultsCount++;
        });

        // Run the main function - parse args, set processor, enqueue urls specified
        engine.main().done(function() {
            // This is handler of success
            logger.info('Crawling Done, ' + resultsCount + ' results!');
        }, function(err) {
            // This is handler of error
            logger.error(err);
        });
    });

}());
