'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright, 2013-2016, by Tomas Korcak. <korczis@gmail.com>
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