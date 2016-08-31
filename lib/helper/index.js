'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.guid = guid;
exports.loadProcessors = loadProcessors;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generates GUID - Globaly Unique Identifier
 * @returns {string} String with GUID
 */
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

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function loadProcessors() {
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
        var pkg = require(item + '/package.json');

        var crawler = pkg.crawler || {};
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
            meta: pkg.crawler
          };
        }
      }

      resolve(res);
    });
  });
}