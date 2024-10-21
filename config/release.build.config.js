const base = require('./build.config.json');

base.asar = true

if (process.platform === 'darwin') {
  base.npmRebuild = true
}

module.exports = base;