import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import pkg from '../../package.json';
import program from 'commander';

import config from '../../config';
import {configDir, configPath} from '../../config';

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
        console.log(err);
        return;
      }

      const configTemplate = path.normalize(path.join(__dirname, '..', '..', 'config', 'config.template.json'));
      console.log(`Copying config template "${configTemplate}" -> "${configPath()}"`)
      const stream = fs.createReadStream(configTemplate).pipe(fs.createWriteStream(configPath()));

      stream.on('finish', () => {
        this.show(args);
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
