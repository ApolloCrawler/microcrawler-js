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

import fs from 'fs';
import path from 'path';

/**
 * Generates GUID - Globaly Unique Identifier
 * @returns {string} String with GUID
 */
export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

export function loadProcessors() {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, '..', '..', 'node_modules');
    fs.readdir(dir, (err, items) => {
      if (err) {
        return reject(err);
      }

      const res = {};

      const prefix = 'microcrawler-crawler-';
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.indexOf(prefix) !== 0) {
          continue;
        }

        const name = item.replace(prefix, '');
        const pkg = require(`${item}/package.json`);

        const crawler = pkg.crawler || {};
        const processors = crawler.processors || {};
        const processorNames = Object.keys(processors);
        for (let j = 0; j < processorNames.length; j++) {
          const processorName = processorNames[j];
          const processorPath = path.join(dir, item, processors[processorName]);
          const processor = require(processorPath);

          const fullName = `${name}.${processorName}`;
          res[fullName] = {
            crawler: name,
            name: processorName,
            fullName,
            path: processorPath,
            processor,
            meta: pkg.crawler
          };
        }
      }

      resolve(res);
    });
  });
}
