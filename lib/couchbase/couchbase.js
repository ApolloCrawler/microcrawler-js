'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _couchbase = require('couchbase');

var _couchbase2 = _interopRequireDefault(_couchbase);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

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
        _this._client = new _couchbase2.default.Cluster(_config2.default.couchbase.uri);
        _this._bucket = _this._client.openBucket(_config2.default.couchbase.bucket, function (err) {
          if (err) {
            return reject(err);
          }
        });

        var defaultTimeout = 10 * 1000;

        _this._bucket.connectionTimeout = _config2.default.couchbase.connectionTimeout || defaultTimeout;
        _this._bucket.operationTimeout = _config2.default.couchbase.operationTimeout || defaultTimeout;
        _this._bucket.connectionTimeout = _config2.default.couchbase.connectionTimeout || defaultTimeout;
        _this._bucket.durabilityTimeout = _config2.default.couchbase.durabilityTimeout || defaultTimeout;
        _this._bucket.managementTimeout = _config2.default.couchbase.managementTimeout || defaultTimeout;
        _this._bucket.nodeConnectionTimeout = _config2.default.couchbase.nodeConnectionTimeout || defaultTimeout;
        _this._bucket.operationTimeout = _config2.default.couchbase.operationTimeout || defaultTimeout;
        _this._bucket.viewTimeout = _config2.default.couchbase.viewTimeout || defaultTimeout;

        _this._bucket.on('connect', function (err) {
          if (err) {
            return reject(err);
          }

          _this._manager = _this._bucket.manager(_config2.default.couchbase.username, _config2.default.couchbase.password);
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
            if (err.code != 13) {
              console.log(err);
              return reject(err);
            } else {
              return resolve(null);
            }
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
            console.log(err);
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