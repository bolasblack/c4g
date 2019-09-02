const _mapValues = require('lodash/mapValues')

module.exports = _mapValues(
  require('@c4605/toolconfs/lint-staged.config'),
  rejectTemplateFiles,
)

function rejectTemplateFiles(cb) {
  return files => {
    return cb(files.filter(f => !f.includes('/files/')))
  }
}
