'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configDir = configDir;
exports.configPath = configPath;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function configDir() {
  return '~/.microcrawler'.replace('~', _os2.default.homedir());
};

function configPath() {
  return _path2.default.join(configDir(), 'config.json');
}

exports.default = function () {
  try {
    return require(configPath());
  } catch (err) {
    // console.log(`File "${configPath()}" was not found.`);
    // console.log(`Run "microcrawler config init" first!`);
    // process.exit(-1);

    return null;
  }
}();

