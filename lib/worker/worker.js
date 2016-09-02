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

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

var _request = require('../helper/request');

var _request2 = _interopRequireDefault(_request);

var _walk = require('../helper/walk');

var _walk2 = _interopRequireDefault(_walk);

var _helper = require('../helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Worker = function () {
  function Worker(args) {
    _classCallCheck(this, Worker);

    this.processors = {};
  }

  _createClass(Worker, [{
    key: 'main',
    value: function main() {
      var _this = this;

      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      (0, _helper.loadProcessors)().then(function (processors) {
        _this.processors = processors;
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

        _logger2.default.info('Worker is connected to "' + _config2.default.amqp.uri + '" and waiting for work.');

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

      _logger2.default.info('Worker is waiting for work at channel "' + _config2.default.amqp.queues.collector + '"');
      channel.consume(_config2.default.amqp.queues.worker, function (data) {
        var msg = JSON.parse(data.content);
        _this3.process(channel, msg);
      }, { noAck: true });
    }
  }, {
    key: 'process',
    value: function process(channel, msg) {
      var processors = this.processors;

      _logger2.default.debug(JSON.stringify(msg, null, 4));

      (0, _request2.default)(msg.url).then(function (data) {
        var doc = _cheerio2.default.load(data);

        var processor = processors[msg.processor];
        if (!processor || !processor.processor) {
          _logger2.default.warn('Unable to find processor', msg.processor);
          return;
        }

        var res = processor.processor(doc, msg);

        var collect = {
          request: msg,
          result: res
        };

        _logger2.default.debug(res);

        var json = JSON.stringify(collect);
        var buffer = Buffer.from(json);
        channel.sendToQueue(_config2.default.amqp.queues.collector, buffer);
      }).catch(function (err) {
        _logger2.default.error(err);
      });
    }
  }]);

  return Worker;
}();

exports.default = Worker;