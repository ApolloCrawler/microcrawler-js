import pkg from '../../package.json'
import process from 'process';
import program from 'commander';

export default class App {
  main(args = process.argv) {
    program
      .version(pkg.version)
      .command('collector [args]', 'Run data collector')
      .command('config [args]', 'Run config')
      .command('exporter [args]', 'Run data exporter')
      .command('worker [args]', 'Run crawler worker')
      .parse(args);
  }
}
