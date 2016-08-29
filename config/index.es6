import os from 'os';
import path from 'path';

export function configDir() {
  return '~/.microcrawler'.replace('~', os.homedir());
};

export function configPath() {
  return path.join(configDir(), 'config.json');
}

export default (() => {
  try {
    return require(configPath());
  } catch (err) {
    // console.log(`File "${configPath()}" was not found.`);
    // console.log(`Run "microcrawler config init" first!`);
    // process.exit(-1);

    return null;
  }
})();
