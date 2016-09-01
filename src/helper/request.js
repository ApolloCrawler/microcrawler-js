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

import config from '../../config';

import randomip from 'random-ip';
import request from 'request';

import superagent from 'superagent-use';
import Proxy from 'superagent-proxy';
import retry from 'superagent-retry';
import Throttle from 'superagent-throttle';

retry(superagent);

let throttle = new Throttle({
  active:     config.throttler.active,    // set false to pause queue
  rate:       config.throttler.rate,      // how many requests can be sent every `ratePer`
  ratePer:    config.throttler.ratePer,   // number of ms in which `rate` requests may be sent
  concurrent: config.throttler.concurrent // how many requests can be sent concurrently
});

if (config.proxy.enabled) {
  Proxy(superagent);
}

if (config.throttler.enabled) {
  superagent.use(throttle.plugin());
}

export function requestSimple(url, retry = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      url: url,
      headers: {
        'Accept': '*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'From': 'googlebot(at)googlebot.com'
      }
    };

    request(options, function (err, resp, body) {
      if (err) {
        return reject(new Error("Unable to fetch '" + url + "', reason: " + err));
      }

      if (resp.statusCode !== 200) {
        return reject(new Error("Unable to fetch '" + url + "', code: " + resp.statusCode));
      }

      return resolve(body);
    });
  });
}


export function requestSuperagent(url, retry = 0) {
  return new Promise((resolve, reject) => {
      let req = superagent
        .get(url)
        .timeout(config.timeout)
        .retry(config.retry.count)
        .redirects(5);

      const headers = Object.keys(config.headers);
      for(let i = 0; i < headers.length; i++) {
        req = req.set(headers[i], config.headers[headers[i]]);
      }

      if (config.natFaker.enabled) {
        const ip = randomip(config.natFaker.base, config.natFaker.bits);
        req = req.set('x-forwarded-for', ip);
      }

      if (config.proxy.enabled) {
        req = req.proxy(config.proxy.list[0]);
      };

      req.end(function (err, res) {
        if (err) {
          if (retry < config.retry.count) {
            const retryNo = retry + 1;
            setTimeout(() => {
              return resolve(requestSuperagent(url, retryNo));
            }, 1000 * retryNo);
          } else {
            return reject(err);
          }
        }

        if (!res) {
          return reject(`Unable to fetch URL "${url}"`);
        }

        if (res.statusType != 2) {
          return reject(`${res.statusCode} - ${res.res.statusMessage}`);
        }

        return resolve(res.text);
      });
  });
};

export default function(url, retry = 0) {
  if (url == null || url == '') {
    return Promise.reject(`Invalid URL specified: "${url}"`);
  }

  if (config.client == 'superagent') {
    return requestSuperagent(url, retry);
  }

  return requestSimple(url, retry);
}