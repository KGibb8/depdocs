const { join, dirname } = require('path')
const depdocs = require('./')

depdocs([
  join(dirname(require.resolve('patchcore')), './!(index).js'),
  join(dirname(require.resolve('patchcore')), './!(node_modules|example)/**/*.js')
], function (err, content) {
  if (err) console.error(err)
  else console.log(content)
})
