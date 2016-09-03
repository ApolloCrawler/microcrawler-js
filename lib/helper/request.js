'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestSimple = requestSimple;
exports.requestSuperagent = requestSuperagent;

exports.default = function (url) {
  var retryNo = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (url === null || url === '') {
    return Promise.reject('Invalid URL specified: "' + url + '"');
  }

  if (_config.config.client === 'superagent') {
    return requestSuperagent(url, retryNo);
  }

  return requestSimple(url, retryNo);
};

var _config = require('../config');

var _randomIp = require('random-ip');

var _randomIp2 = _interopRequireDefault(_randomIp);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _superagentUse = require('superagent-use');

var _superagentUse2 = _interopRequireDefault(_superagentUse);

var _superagentProxy = require('superagent-proxy');

var _superagentProxy2 = _interopRequireDefault(_superagentProxy);

var _superagentRetry = require('superagent-retry');

var _superagentRetry2 = _interopRequireDefault(_superagentRetry);

var _superagentThrottle = require('superagent-throttle');

var _superagentThrottle2 = _interopRequireDefault(_superagentThrottle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _superagentRetry2.default)(_superagentUse2.default); // Copyright, 2013-2016, by Tomas Korcak. <korczis@gmail.com>
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

var throttle = new _superagentThrottle2.default({
  active: _config.config.throttler.active, // set false to pause queue
  rate: _config.config.throttler.rate, // how many requests can be sent every `ratePer`
  ratePer: _config.config.throttler.ratePer, // number of ms in which `rate` requests may be sent
  concurrent: _config.config.throttler.concurrent // how many requests can be sent concurrently
});

if (_config.config.proxy.enabled) {
  (0, _superagentProxy2.default)(_superagentUse2.default);
}

if (_config.config.throttler.enabled) {
  _superagentUse2.default.use(throttle.plugin());
}

function requestSimple(url) {
  var retryNo = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return new Promise(function (resolve, reject) {
    var options = {
      url: url,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'From': 'googlebot(at)googlebot.com'
      }
    };

    (0, _request2.default)(options, function (err, resp, body) {
      if (err) {
        if (retryNo < _config.config.retry.count) {
          setTimeout(function () {
            return resolve(requestSimple(url, retryNo + 1));
          }, 1000 * retryNo);
        } else {
          return reject(new Error("Unable to fetch '" + url + "', reason: " + err));
        }
      }

      if (resp.statusCode !== 200) {
        return reject(new Error("Unable to fetch '" + url + "', code: " + resp.statusCode));
      }

      return resolve(body);
    });
  });
}

function requestSuperagent(url) {
  var retryNo = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return new Promise(function (resolve, reject) {
    var req = _superagentUse2.default.get(url).timeout(_config.config.timeout).retry(_config.config.retry.count).redirects(5);

    var headers = Object.keys(_config.config.headers);
    for (var i = 0; i < headers.length; i++) {
      req = req.set(headers[i], _config.config.headers[headers[i]]);
    }

    if (_config.config.natFaker.enabled) {
      var ip = (0, _randomIp2.default)(_config.config.natFaker.base, _config.config.natFaker.bits);
      req = req.set('x-forwarded-for', ip);
    }

    if (_config.config.proxy.enabled) {
      req = req.proxy(_config.config.proxy.list[0]);
    }

    req.end(function (err, res) {
      if (err) {
        if (retryNo < _config.config.retry.count) {
          setTimeout(function () {
            return resolve(requestSuperagent(url, retryNo + 1));
          }, 1000 * retryNo);
        } else {
          return reject(err);
        }
      }

      if (!res) {
        return reject('Unable to fetch URL "' + url + '"');
      }

      if (res.statusType !== 2) {
        return reject(res.statusCode + ' - ' + res.res.statusMessage + ', url: ' + url);
      }

      return resolve(res.text);
    });
  });
}