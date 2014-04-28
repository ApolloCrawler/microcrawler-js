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
        'http',
        'faye'
    ];

    define(deps, function(deferred, http, faye) {
        var logger = require('./../logger');

        /**
         * Publish Subscribe Implementation using faye
         *
         * See http://faye.jcoglan.com/
         *
         * @param opts
         * @returns {PubSubFaye}
         * @constructor
         */
        function PubSubFaye(opts) {
            this.opts = opts || {
                port: 8000,
                root: '/'
            };

            return this;
        }

        PubSubFaye.prototype.init = function() {
            logger.info('Initializing PubSubFaye.');

            this.server = http.createServer(),
            this.bayeux = new faye.NodeAdapter({
                mount: this.opts.root
            });

            var port = this.opts.port;

            logger.info('Creating local faye server on port ' + port)
            this.bayeux.attach(this.server);
            this.server.listen(port);

            var url = 'http://localhost:' + port + '/';

            logger.info('Connecting to local faye server - ' + url);
            this.client = new faye.Client(url);

            this.publish = this.client.publish;

            this.subscribe = this.client.subscribe;

            return deferred(true);
        };

        PubSubFaye.prototype.stop = function() {
            if(this.server) {
                logger.info('Stopping PubSubFaye.');
                this.server.close();
            }
        };

        module.exports = PubSubFaye;
    });
}());