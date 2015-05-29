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
        'sqlite3',
        'util'
    ];

    define(deps, function(deferred, sqlite3, util) {
        var QueueBase = require('./queueBase'),
            Helpers = require('../helper');

        /**
         * SQLite backed queue implementation
         * @param opts Optional options
         * @returns {QueueMemory}
         * @constructor
         */
        function QueueSqlite(opts) {
            opts = opts || {};

            this.sqlite = sqlite3.verbose();
            this.db = null;

            return this;
        }

        util.inherits(QueueSqlite, QueueBase);

        QueueSqlite.prototype.getDb = function() {
            return this.initialize();
        };

        QueueSqlite.prototype.initialize = function() {
            var d = deferred();

            if(this.db) {
                return d.resolve(this.db);
            } else {
                var db = new this.sqlite.Database('queue.db');

                var self = this;
                db.serialize(function() {
                    db.run("DROP TABLE IF EXISTS queue;");

                    db.run("CREATE TABLE IF NOT EXISTS queue (guid TEXT PRIMARY KEY, url TEXT, processor TEXT, category TEXT, raw TEXT);", function(err) {
                        if(err) {
                            return d.reject(err);

                        }

                        // db.run("CREATE UNIQUE INDEX IF  NOT EXISTS idx_url_processor ON queue(url, processor);");

                        self.db = db;
                        d.resolve(self.db);
                    });

                });
            }

            return d.promise();
        }

        /**
         * Get count of items in queue
         * @param queue object or name
         */
        QueueSqlite.prototype.count = function(queue) {
            var d = deferred();

            var self = this;
            this.db.serialize(function() {
                self.db.each("SELECT count(*) FROM queue WHERE category = '" + queue + "'", function (err, row) {
                    if (err) {
                        return d.reject(err);
                    }

                    return d.resolve(row['count(*)']);
                });
            });

            return d.promise();
        };

        /**
         * Checks if item exists in queue
         * @param queue object or name
         */
        QueueSqlite.prototype.exist = function(item, queue) {
            var d = deferred();

            this.find(item, queue).then(function(res) {
                return d.resolve(res !== undefined && res !== null);
            }).done();

            return d.promise();
        };

        /**
         *
         * @param item Item to be found
         * @param {(string | string[])} queue Queue to look in
         * @returns {*} Item if found, null elsewhere
         */
        QueueSqlite.prototype.find = function(item, queue, remove) {
            var d = deferred();

            var self = this;
            this.db.serialize(function() {
                self.db.get("SELECT * FROM queue WHERE url = '" + item.url + "'", function (err, row) {
                    // TODO: Convert here if needed!
                    if (remove) {
                        self.db.run("DELETE FROM queue where guid = '" + item.guid + "';", function (err, res) {
                            if (err) {
                                return d.reject(err);
                            }

                            d.resolve(row ? JSON.parse(row.raw) : row);
                        });
                    } else {
                        return d.resolve(row ? JSON.parse(row.raw) : row);
                    }
                });
            });

            return d.promise();
        };

        /**
         * Get item from queue, queue can be object or name
         * @param queue
         */
        QueueSqlite.prototype.get = function(queue) {
            var d = deferred();

            this.db.get("SELECT * FROM queue WHERE category = '" + queue + "' LIMIT 1;", function(err, row) {
                if(err) {
                    return d.reject(err);
                }

                return d.resolve(row ? JSON.parse(row.raw) : row);
            });

            return d.promise();
        };

        /**
         * Move item from 'fromQueue' to 'toQueue'
         * @param item
         * @param from
         * @param to
         */
        QueueSqlite.prototype.move = function(item, from, to) {
            var d = deferred();

            var query = "UPDATE queue set category = '" + to + "' WHERE category = '" + from + "' AND guid = '" + item.guid + "';"
            this.db.run(query, function(err, row) {
                if(err) {
                    return d.reject(err);
                }

                return d.resolve(row ? JSON.parse(row.raw) : row);
            });

            return d.promise();
        };

        /**
         * Put item to queue specified
         * @param queue Object or name
         * @param item
         */
        QueueSqlite.prototype.put = function(item, queue) {
            var d = deferred();

            if(!item.guid) {
                item.guid = Helpers.guid()
            }

            var query = "INSERT INTO queue (guid, url, category, processor, raw) VALUES ('" + item.guid + "', '" + item.url + "', '" + queue + "', '" + item.processor + "', '" + JSON.stringify(item).replace("'", "\\'") + "');"
            this.db.run(query, function(err, res) {
                if(err) {
                    return d.reject(res);
                }

                return d.resolve(item);
            });

            return d.promise();
        };

        module.exports = QueueSqlite;
    });
}());