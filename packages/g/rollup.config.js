require('ts-node').register({
  compilerOptions: {
    esModuleInterop: true,
  },
})

module.exports = require('./scripts/rollup.config.ts')
