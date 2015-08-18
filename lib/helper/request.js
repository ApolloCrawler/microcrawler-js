// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
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

import deferred from 'deferred';
import request from 'request';

/**
 * Request Class
 * @constructor
 */
function Request() {
}

Request.request = function(url) {
  const d = deferred();

  const options = {
    url: url,
    headers: {
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'From': 'googlebot(at)googlebot.com'
    }
  };

  request(options, function(err, resp, body) {
    if (err) {
      return d.reject(new Error("Unable to fetch '" + url + "', reason: " + err));
    }

    if (resp.statusCode !== 200) {
      return d.reject(new Error("Unable to fetch '" + url + "', code: " + resp.statusCode));
    }

    return d.resolve(body);
  });

  return d.promise();
};

const maxConcurrencyLimit = 10;

Request.limitedRequest = deferred.gate(function async(url) {
  return Request.request(url);
}, maxConcurrencyLimit);

export default Request;
