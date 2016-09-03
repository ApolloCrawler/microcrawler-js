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

var _config = require('../config');

var _logger = require('../logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var App = function () {
  function App() {
    _classCallCheck(this, App);
  }

  _createClass(App, [{
    key: 'main',
    value: function main() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).command('collector [args]', 'Run data collector').command('config [args]', 'Run config').command('exporter [args]', 'Run data exporter').command('worker [args]', 'Run crawler worker').command('crawl [args]', 'Crawl specified site').parse(args);
    }
  }, {
    key: 'crawl',
    value: function crawl() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      var processor = args[2];
      var url = args[3];

      _callback_api2.default.connect(_config.config.amqp.uri, function (err, connection) {
        if (err) {
          _logger2.default.error(err);
          return;
        }

        connection.createChannel(function (err, channel) {
          if (err) {
            _logger2.default.error(err);
            return;
          }

          channel.assertQueue(_config.config.amqp.queues.worker, {
            durable: false
          });

          var msg = {
            url: url,
            processor: processor
          };

          _logger2.default.info('Initializing crawling of \'' + url + '\' using \'' + processor + '\' processor.');

          var res = channel.sendToQueue(_config.config.amqp.queues.worker, Buffer.from(JSON.stringify(msg)));
          // console.log(res);

          setTimeout(function () {
            process.exit(0);
          }, 1000);
        });
      });
    }
  }]);

  return App;
}();

exports.default = App;