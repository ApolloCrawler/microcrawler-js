// Copyright, 2013-2015, by Tomas Korcak. <korczis@gmail.com>
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

import deferred from 'deferred';
import sqlite3 from 'sqlite3';
import util from 'util';

import QueueBase from './queueBase';
import Helpers from '../helper';

/**
 * SQLite backed queue implementation
 * @param opts Optional options
 * @returns {QueueMemory}
 * @constructor
 */
function QueueSqlite(opts) {
  this.opts = opts || {};

  this.sqlite = sqlite3.verbose();
  this.db = null;

  this.tableName = opts['queue-name'];

  return this;
}

util.inherits(QueueSqlite, QueueBase);

QueueSqlite.prototype.getDb = function() {
  return this.initialize();
};

QueueSqlite.prototype.initialize = function() {
  const d = deferred();

  if (!this.db) {
    const db = new this.sqlite.Database(this.opts['queue-file']);

    const self = this;
    db.serialize(function() {
      if (self.opts.flush) {
        db.run('DROP TABLE IF EXISTS ' + self.tableName + ';');
      }

      db.run('CREATE TABLE IF NOT EXISTS ' + self.tableName + ' (guid TEXT PRIMARY KEY, url TEXT, processor TEXT, category TEXT, raw TEXT);');

      db.run('CREATE INDEX IF NOT EXISTS idx_category ON ' + self.tableName + '(category);');

      // db.run("CREATE INDEX IF NOT EXISTS idx_guid ON " + self.tableName + "(guid);");

      db.run('CREATE INDEX IF NOT EXISTS idx_processor ON ' + self.tableName + '(processor);');

      db.run('CREATE INDEX IF NOT EXISTS idx_url ON ' + self.tableName + '(url);', function(err) {
        if (err) {
          return d.reject(err);
        }

        self.db = db;
        d.resolve(self.db);
      });
    });
  } else {
    return d.resolve(this.db);
  }

  return d.promise();
};

/**
 * Get count of items in queue
 * @param queue object or name
 */
QueueSqlite.prototype.count = function(queue) {
  const d = deferred();

  const self = this;
  this.db.serialize(function() {
    self.db.each('SELECT count(*) FROM ' + self.tableName + " WHERE category = '" + queue + "'", function(err, row) {
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
  const d = deferred();

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
  const d = deferred();

  const self = this;
  this.db.serialize(function() {
    self.db.get('SELECT * FROM ' + self.tableName + " WHERE url = '" + item.url + "'", function(err, row) {
      // TODO: Convert here if needed!
      if (remove) {
        self.db.run('DELETE FROM ' + self.tableName + " where guid = '" + item.guid + "';", function(deleteError) {
          if (deleteError) {
            return d.reject(deleteError);
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
  const d = deferred();

  this.db.get('SELECT * FROM ' + this.tableName + " WHERE category = '" + queue + "' LIMIT 1;", function(err, row) {
    if (err) {
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
  const d = deferred();

  const query = 'UPDATE ' + this.tableName + " set category = '" + to + "' WHERE category = '" + from + "' AND guid = '" + item.guid + "';";
  this.db.run(query, function(err, row) {
    if (err) {
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
  const d = deferred();

  if (!item.guid) {
    item.guid = Helpers.guid();
  }

  const query = 'INSERT INTO ' + this.tableName + ' (guid, url, category, processor, raw) VALUES (\'' + item.guid + "', '" + item.url + "', '" + queue + "', '" + item.processor + "', '" + JSON.stringify(item).replace("'", "\\'") + '\');';
  this.db.run(query, function(err, res) {
    if (err) {
      return d.reject(res);
    }

    return d.resolve(item);
  });

  return d.promise();
};

export default QueueSqlite;
