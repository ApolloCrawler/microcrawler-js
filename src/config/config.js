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
import merge from 'node.extend';
import mkdirp from 'mkdirp';
import os from 'os';
import path from 'path';
import pkg from '../../package.json';
import program from 'commander';

import logger from '../logger';

export function configDir() {
  if (os.homedir) {
    return '~/.microcrawler'.replace('~', os.homedir());
  }

  return '~/.microcrawler'.replace('~', require('homedir')());
}

export function configPath() {
  return path.join(configDir(), 'config.json');
}

const configData = (() => {
  try {
    return merge(true, pkg.config, require(configPath()));
  } catch (err) {
    return pkg.config;
  }
})();

export const config = configData;

export default class Config {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .command('init', 'Initialize config file')
      .command('show', 'Show config file')
      .parse(args);
  }

  init(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    mkdirp(configDir(), (err) => {
      if (err) {
        logger.error(err);
        return;
      }

      logger.info(`Creating config file "${configPath()}"`);

      fs.writeFile(configPath(), JSON.stringify(pkg.config, null, 4), (error) => {
        if (error) {
          return logger.error(error);
        }

        this.show();
      });
    });
  }

  show(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    console.log(JSON.stringify(config, null, 4));
  }
}
