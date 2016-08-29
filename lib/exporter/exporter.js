import pkg from '../../package.json'
import process from 'process';
import program from 'commander';

export default class Exporter {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .parse(args);

    console.log('Not implemented yet!');
  }
};
