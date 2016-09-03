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
};

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

      logger.info(`Creating config file "${configPath()}"`)

      fs.writeFile(configPath(), JSON.stringify(pkg.config, null, 4), (err) => {
        if(err) {
          return logger.error(err);
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
