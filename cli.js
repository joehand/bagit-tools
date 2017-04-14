var bagTools = require('.')

var dir = process.argv[2] || process.cwd()

bagTools.verify(dir, function (err, valid, results) {
  if (err) throw err
  if (valid) console.log('VALID')
  else console.log('FAIL')
})
