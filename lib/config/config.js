'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Config = function () {
  function Config() {
    _classCallCheck(this, Config);
  }

  _createClass(Config, [{
    key: 'main',
    value: function main() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).command('init', 'Initialize config file').command('show', 'Show config file').parse(args);
    }
  }, {
    key: 'init',
    value: function init() {
      var _this = this;

      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      (0, _mkdirp2.default)((0, _config.configDir)(), function (err) {
        if (err) {
          console.log(err);
          return;
        }

        var configTemplate = _path2.default.normalize(_path2.default.join(__dirname, '..', '..', 'config', 'config.template.json'));
        console.log('Copying config template "' + configTemplate + '" -> "' + (0, _config.configPath)() + '"');
        var stream = _fs2.default.createReadStream(configTemplate).pipe(_fs2.default.createWriteStream((0, _config.configPath)()));

        stream.on('finish', function () {
          _this.show(args);
        });
      });
    }
  }, {
    key: 'show',
    value: function show() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? process.argv : arguments[0];

      _commander2.default.version(_package2.default.version).parse(args);

      console.log(JSON.stringify(_config2.default, null, 4));
    }
  }]);

  return Config;
}();

exports.default = Config;