const test = require('tape')

const depdocs = require('../')

test('depdocs', function (t) {
  t.ok(depdocs, 'module is require-able')
  t.end()
})
