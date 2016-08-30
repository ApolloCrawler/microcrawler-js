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

      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      var processorsPath = _path2.default.join(__dirname, '..', '..', 'examples');
      this.loadProcessors(processorsPath).then(function (processors) {
        _this.processors = processors;
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

        console.log('Worker is connected to "' + _config2.default.amqp.uri + '" and waiting for work.');

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

      console.log('Worker is waiting for work at channel "' + _config2.default.amqp.queues.collector + '"');
      channel.consume(_config2.default.amqp.queues.worker, function (data) {
        var msg = JSON.parse(data.content);
        _this3.process(channel, msg);
      }, { noAck: true });
    }
  }, {
    key: 'process',
    value: function process(channel, msg) {
      var processors = this.processors;

      console.log(JSON.stringify(msg, null, 4));

      (0, _request2.default)(msg.url).then(function (data) {
        var doc = _cheerio2.default.load(data);

        var processor = processors[msg.processor];
        if (!processor || !processor.processor) {
          console.log('Unable to find processor', msg.processor);
          return;
        }

        var res = processor.processor(doc, msg);

        var collect = {
          request: msg,
          result: res
        };

        console.log(res);

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

      var processor = require(fullPath);
      this.registerProcessor(name, processor);

      return {
        name: name,
        path: fullPath,
        processor: processor
      };
    }
  }, {
    key: 'loadProcessors',
    value: function loadProcessors(pathDir) {
      return new Promise(function (resolve, reject) {
        var dir = _path2.default.join(__dirname, '..', '..', 'node_modules');
        _fs2.default.readdir(dir, function (err, items) {
          if (err) {
            return reject(err);
          }

          var res = {};

          var prefix = 'microcrawler-crawler-';
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.indexOf(prefix) != 0) {
              continue;
            }

            var name = item.replace(prefix, '');
            var _pkg = require(item + '/package.json');

            var crawler = _pkg.crawler || {};
            var processors = crawler.processors || {};
            var processorNames = Object.keys(processors);
            for (var j = 0; j < processorNames.length; j++) {
              var processorName = processorNames[j];
              var processorPath = _path2.default.join(dir, item, processors[processorName]);
              var processor = require(processorPath);

              var fullName = name + '.' + processorName;
              res[fullName] = {
                crawler: name,
                name: processorName,
                fullName: fullName,
                path: processorPath,
                processor: processor,
                meta: _pkg.crawler
              };
            }
          }

          resolve(res);
        });
      });
    }
  }, {
    key: 'registerProcessor',
    value: function registerProcessor(name, processor) {
      if (!name) {
        throw new TypeError('name must be specified');
      }

      this.processors[name] = processor;
      return processor;
    }
  }]);

  return Worker;
}();

exports.default = Worker;