'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _callback_api = require('amqplib/callback_api');

var _callback_api2 = _interopRequireDefault(_callback_api);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _request = require('../helper/request');

var _request2 = _interopRequireDefault(_request);

var _walk = require('../helper/walk');

var _walk2 = _interopRequireDefault(_walk);

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

      var args = arguments.length <= 0 || arguments[0] === undefined ? _process2.default.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      var processorsPath = _path2.default.join(__dirname, '..', '..', 'examples');
      this.loadProcessors(processorsPath).then(function (processors) {
        _this.connect();
      }).catch(function (err) {
        console.log(err);
      });
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      _callback_api2.default.connect(_config2.default.amqp.uri, function (err, connection) {
        if (err) {
          console.log(err);
          return;
        }

        connection.createChannel(function (err, channel) {
          if (err) {
            console.log(err);
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

      channel.consume(_config2.default.amqp.queues.worker, function (data) {
        var msg = JSON.parse(data.content);
        _this3.process(channel, msg);
      }, { noAck: true });

      var msg = {
        url: 'https://www.firmy.cz?_escaped_fragment_=',
        processor: 'firmy.cz.index'

        // url: 'http://www.firmy.cz/Auto-moto?page=1&_escaped_fragment_=',
        // processor: 'firmy.cz.listing'

        // url: 'https://xkcd.com',
        // processor: 'xkcd.com.listing'
      };

      channel.sendToQueue(_config2.default.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));
    }
  }, {
    key: 'process',
    value: function process(channel, msg) {
      var processors = this.processors;

      console.log(JSON.stringify(msg, null, 4));

      (0, _request2.default)(msg.url).then(function (data) {
        var doc = _cheerio2.default.load(data);

        var fn = processors[msg.processor];
        if (!fn) {
          console.log('Unable to find processor', msg.processor);
          return;
        }

        var res = fn(doc, msg);

        var collect = {
          request: msg,
          result: res
        };

        // console.log(res);

        var json = JSON.stringify(collect);
        var buffer = Buffer.from(json);
        channel.sendToQueue(_config2.default.amqp.queues.collector, buffer);
      }).catch(function (err) {
        console.log(err);
      });
    }
  }, {
    key: 'loadProcessor',
    value: function loadProcessor(pathDir, fullPath) {
      var name = _path2.default.relative(pathDir, fullPath).replace(_path2.default.extname(fullPath), '').replace(_path2.default.sep, '.');

      this.registerProcessor(name, require(fullPath));

      return {
        name: name,
        path: fullPath,
        processor: require(fullPath)
      };
    }
  }, {
    key: 'loadProcessors',
    value: function loadProcessors(pathDir) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        (0, _walk2.default)(pathDir, function (err, results) {
          if (err) {
            console.log(err);
            reject(err);
          }

          var processors = [];

          for (var i = 0; i < results.length; i++) {
            var fullPath = results[i];
            var proc = _this4.loadProcessor(pathDir, fullPath);
            processors.push(proc);
          }

          resolve(processors);
        });
      });
    }
  }, {
    key: 'registerProcessor',
    value: function registerProcessor(name, processor) {
      if (!name) {
        throw new TypeError('name must be specified');
      }

      this.processors[name] = processor.default;
      return processor;
    }
  }]);

  return Worker;
}();

exports.default = Worker;