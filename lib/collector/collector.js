'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _callback_api = require('amqplib/callback_api');

var _callback_api2 = _interopRequireDefault(_callback_api);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _couchbase = require('../couchbase');

var _couchbase2 = _interopRequireDefault(_couchbase);

var _elasticsearch = require('../elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Collector = function () {
  function Collector() {
    _classCallCheck(this, Collector);

    this._couchbase = new _couchbase2.default();
    this._elasticsearch = new _elasticsearch2.default();
  }

  _createClass(Collector, [{
    key: 'main',
    value: function main() {
      var _this = this;

      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      this.couchbase.init().then(function () {
        _this.connect();
      }).catch(function (err) {
        _logger2.default.error(err);
      });
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      _callback_api2.default.connect(_config2.default.amqp.uri, function (err, connection) {
        if (err) {
          _logger2.default.error(err);
          return;
        }

        _logger2.default.info('Collector is connected to "' + _config2.default.amqp.uri + '" and waiting for results.');

        connection.createChannel(function (err, channel) {
          if (err) {
            _logger2.default.error(err);
            return;
          }

          _this2.run(channel);
        });
      });
    }
  }, {
    key: 'run',
    value: function run(channel) {
      var _this3 = this;

      channel.assertQueue(_config2.default.amqp.queues.collector, {
        durable: false
      });

      channel.assertQueue(_config2.default.amqp.queues.worker, {
        durable: false
      });

      _logger2.default.info('Collector is consuming results at channel "' + _config2.default.amqp.queues.collector + '"');
      channel.consume(_config2.default.amqp.queues.collector, function (data) {
        var msg = JSON.parse(data.content);

        // console.log(JSON.stringify(msg, null, 4));

        var promise = Promise.resolve(true);

        var _loop = function _loop() {
          var item = msg.result[i];

          if (item.type == 'url') {
            promise = promise.then(function () {
              return _this3.processUrl(channel, item);
            });
          } else if (item.type == 'data') {
            promise = promise.then(function () {
              return _this3.processData(channel, msg, item);
            });
          }
        };

        for (var i = 0; i < msg.result.length; i++) {
          _loop();
        }
      }, { noAck: true });
    }
  }, {
    key: 'processUrl',
    value: function processUrl(channel, item) {
      var _this4 = this;

      var hash = _crypto2.default.createHash('sha256').update(item.url).digest('hex');
      var id = 'url-' + item.processor + '-' + hash;

      return new Promise(function (resolve, reject) {
        _this4.couchbase.get(id).then(function (doc) {
          if (doc) {
            return resolve(doc);
          }

          var msg = {
            processor: item.processor,
            url: item.url
          };

          channel.sendToQueue(_config2.default.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));

          var ts = new Date().toISOString();
          item['createdAt'] = ts;
          item['updatedAt'] = ts;

          resolve(_this4.couchbase.upsert(id, item));
        });
      });
    }
  }, {
    key: 'processData',
    value: function processData(channel, msg, item) {
      var hash = _crypto2.default.createHash('sha256').update(msg.request.url).digest('hex');
      var id = 'data-' + msg.request.processor + '-' + hash;

      var ts = new Date().toISOString();
      item['createdAt'] = ts;
      item['updatedAt'] = ts;

      this.elasticsearch.client.index({
        id: id,
        index: _config2.default.elasticsearch.index,
        type: 'document',
        body: item
      });

      return this.couchbase.upsert(id, item);
    }
  }, {
    key: 'couchbase',
    get: function get() {
      return this._couchbase;
    }
  }, {
    key: 'elasticsearch',
    get: function get() {
      return this._elasticsearch;
    }
  }]);

  return Collector;
}();

exports.default = Collector;
;