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
        'deepmerge',
        'deferred',
        'nano',
        'util'
    ];

    define(deps, function (merge, deferred, nano, util) {
        var QueueBase = require('./queueBase');
        var logger = require('../logger');

        /**
         * In memory queue implementation
         * @param opts Optional options
         * @returns {QueueCouchDb}
         * @constructor
         */
        function QueueCouchDb(opts) {
            opts = opts || {};

            this.opts = merge(QueueCouchDb.defaultOptions, opts);

            this._reset();

            return this;
        }

        util.inherits(QueueCouchDb, QueueBase);

        QueueCouchDb.defaultOptions = {
            uri: 'http://apollo:apollo@localhost:5984/',
            db: 'microcrawler-test',
            designDocName: 'microcrawler-test-search',
            name: 'test-queue',
            type: 'queueItem',
            deleteDocuments: true
        };

        /**
         * Cleanup queue connection
         */
        QueueCouchDb.prototype.cleanup = function () {
            this._reset();

            return deferred(true);
        };

        /**
         * Get count of items in queue
         */
        QueueCouchDb.prototype.count = function (opts) {
            if(!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            var d = deferred();

            var self = this;
            this.db.view(opts.designDocName, opts.name, { limit: 0 }, function(err, body) {
                if (err) {
                    throw err;
                }

                d.resolve(body['total_rows']);
            });

            return d.promise();
        };

        /**
         * Get item from queue, queue can be object or name
         */
        QueueCouchDb.prototype.get = function (opts) {
            if(!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            var d = deferred();

            var self = this;
            this.db.view(opts.designDocName, opts.name, { include_docs: true }, function(err, body) {
                if (err) {
                    throw err;
                }

                // logger.info('QueueCouchDb.get() - Got document: ' + JSON.stringify(body));

                var res = null;
                var rows = body['rows'];

                if(rows && rows.length > 0) {
                    console.log(rows[0]);
                    res = rows[0].doc;
                }

                logger.info('QueueCouchDb.get() - returning item: ' + JSON.stringify(res, null, 4));

                if(opts.deleteDocuments) {
                    self.db.destroy(res._id, res._rev, function(err, data) {
                        if(err) {
                            throw err;
                        }

                        d.resolve(res);
                    });
                } else {
                    res[opts.type].status = 'done';

                    self.db.insert(res, res._id, function(err, data) {
                        if(err) {
                            throw err;
                        }

                        d.resolve(res);
                    });
                }
            });

            return d.promise();
        };

        QueueCouchDb.prototype.init = function (opts) {
            if (!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            // Connect to CouchDB
            logger.info("QueueCouchDb.init() - Connecting '" + opts.uri + "'");
            this.connection = nano(opts.uri);

            var self = this;

            // Try to create database
            return this._createDb(opts)
                .then(function () {
                    // Create design document
                    return self._createDesignDocument();
                }).then(function (designDoc) {
                    // Create views needed for work
                    return self._createViews(designDoc);
                });
        };

        /**
         * Put item to queue specified
         * @param item
         * @param opts
         */
        QueueCouchDb.prototype.put = function (item, opts) {
            var d = deferred();

            if (!opts) {
                opts = {};
            }

            // Merge intstance options with call specific overrides
            opts = merge(this.opts, opts);

            // Construct raw couchdb document
            var doc = {
                type: opts.type
            };

            // Add timestamps
            var ts = new Date().getTime();
            doc['ts'] = {
                createdAt: ts,
                updatedAt: ts
            };

            // Set item to document
            doc[opts.type] = item;

            // Get item reference back from document
            item = doc[opts.type];

            // Set item's document name
            item['queueName'] = opts.name;

            // Set status to queued
            item['status'] = 'queued';

            logger.info('QueueCouchDb.put() - Inserting document: ' + JSON.stringify(doc));

            // Insert document to couchdb
            this.db.insert(doc, null, function (err, body, header) {
                if (err) {
                    throw err;
                }

                d.resolve(body);
            });

            return d.promise();
        };

        QueueCouchDb.prototype._createDb = function (opts) {
            if (!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            var d = deferred();

            var self = this;

            // Create database if not exists yet
            this.connection.db.create(opts.db, function () {

                logger.info("QueueCouchDb._createDb() - Using DB '" + opts.db + "'");

                self.db = self.connection.use(opts.db, function (err) {
                    if (err) {
                        throw err;
                    }
                });

                d.resolve(self);
            });

            return d.promise();
        };

        QueueCouchDb.prototype._createDesignDocument = function (opts) {
            logger.info('QueueCouchDb._createDesignDocument() - Creating or updating design document (if needed).');

            if (!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            // TODO: Do not have map function hard-coded
            var designDoc = {
                "views": {}
            };

            var d = deferred();

            var self = this;

            var fullDesignDocName = '_design/' + opts.designDocName;

            // Try to get existing design document
            this.db.get(fullDesignDocName, {}, function (err, body) {
                if (!err) {
                    d.resolve(body);
                    return;
                }

                self.db.insert(designDoc, fullDesignDocName, function (err, body) {
                    if (err) {
                        throw err;
                    }

                    var res = merge(designDoc, body);
                    d.resolve(res);
                });
            });

            return d.promise();
        };

        QueueCouchDb.prototype._createViews = function (designDoc, opts) {
            if(!opts) {
                opts = {};
            }

            opts = merge(this.opts, opts);

            logger.info('QueueCouchDb._createViews() - Creating views.');

            if(designDoc['views'][opts.name]) {
                return deferred(true);
            }

            designDoc['views'][opts.name] = {
                "map": "function (doc) { \
                    if (doc.type === '" + opts.type + "' && doc['" + opts.type + "'].status === 'queued') { \
                        emit(doc.ts.createdAt, null); \
                    } \
                }"
            };

            var d = deferred();

            var fullDesignDocName = '_design/' + opts.designDocName;

            var self = this;
            this.db.insert(designDoc, fullDesignDocName, function (err, body) {
                if (err) {
                    if(err.error !== 'conflict') {
                        throw err;
                    }

                    // TODO: Handle update conflict (step 1) by fetching latest design document
                    // TODO: Handle update conflict (step 2) by attempting _updateViews again

                    self._createDesignDocument().then(function(designDoc) {
                        d.resolve(self._createViews(designDoc, opts));
                    });
                } else {
                    d.resolve(body);
                }
            });

            return d.promise();
        };

        QueueCouchDb.prototype._reset = function () {
            this.connection = null;

            this.db = null;
        };

        module.exports = QueueCouchDb;
    });
}());
