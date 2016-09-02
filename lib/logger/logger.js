'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logPath = '~/.microcrawler/log.txt'.replace('~', _os2.default.homedir());

var logger = new _winston2.default.Logger({
  transports: [new _winston2.default.transports.File({
    level: 'info',
    filename: logPath,
    handleExceptions: true,
    json: false,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    timestamp: true
  }), new _winston2.default.transports.Console({
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    timestamp: true
  })],
  exitOnError: false
});

exports.default = logger;