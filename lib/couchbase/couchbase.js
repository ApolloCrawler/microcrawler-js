'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright, 2013-2016, by Tomas Korcak. <korczis@gmail.com>
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

var _couchbase = require('couchbase');

var _couchbase2 = _interopRequireDefault(_couchbase);

var _config = require('../config');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Couchbase = function () {
  function Couchbase() {
    _classCallCheck(this, Couchbase);

    this._client = null;
    this._bucket = null;
    this._manager = null;
  }

  _createClass(Couchbase, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this._client = new _couchbase2.default.Cluster(_config.config.couchbase.uri);
        _this._bucket = _this._client.openBucket(_config.config.couchbase.bucket, function (err) {
          if (err) {
            return reject(err);
          }
        });

        var defaultTimeout = 10 * 1000;

        _this._bucket.connectionTimeout = _config.config.couchbase.connectionTimeout || defaultTimeout;
        _this._bucket.operationTimeout = _config.config.couchbase.operationTimeout || defaultTimeout;
        _this._bucket.connectionTimeout = _config.config.couchbase.connectionTimeout || defaultTimeout;
        _this._bucket.durabilityTimeout = _config.config.couchbase.durabilityTimeout || defaultTimeout;
        _this._bucket.managementTimeout = _config.config.couchbase.managementTimeout || defaultTimeout;
        _this._bucket.nodeConnectionTimeout = _config.config.couchbase.nodeConnectionTimeout || defaultTimeout;
        _this._bucket.operationTimeout = _config.config.couchbase.operationTimeout || defaultTimeout;
        _this._bucket.viewTimeout = _config.config.couchbase.viewTimeout || defaultTimeout;

        _this._bucket.on('connect', function (err) {
          if (err) {
            return reject(err);
          }

          _this._manager = _this._bucket.manager(_config.config.couchbase.username, _config.config.couchbase.password);
          resolve(_this);
        });
      });
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.bucket.get(id, function (err, res) {
          if (err) {
            if (err.code !== 13) {
              _logger2.default.error(err);
              return reject(err);
            }

            return resolve(null);
          }

          resolve(res);
        });
      });
    }
  }, {
    key: 'upsert',
    value: function upsert(id, data) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.bucket.upsert(id, data, function (err, res) {
          if (err) {
            _logger2.default.error(err);
            return reject(err);
          }

          resolve(res);
        });
      });
    }
  }, {
    key: 'client',
    get: function get() {
      return this._client;
    }
  }, {
    key: 'manager',
    get: function get() {
      return this._manager;
    }
  }, {
    key: 'bucket',
    get: function get() {
      return this._bucket;
    }
  }]);

  return Couchbase;
}();

exports.default = Couchbase;