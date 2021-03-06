var fs = require('fs')
var path = require('path')
var test = require('tape')
var bagTools = require('..')

var bagDir = './node_modules/bagit-conformance-suite/'

test('valid bags v0.97', function (t) {
  var version = 'v0.97'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.97', test: true, valid: true}, next)
    }
  })
})

test('invalid bags v0.97', function (t) {
  var version = 'v0.97'
  var dir = path.join(bagDir, version, 'invalid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.97', test: true, valid: false}, next)
    }
  })
})

test('warning bags v0.97', function (t) {
  var version = 'v0.97'
  var dir = path.join(bagDir, version, 'warning')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      fs.stat(bag, function (err, stat) {
        if (err || !stat.isDirectory()) return next()
        verify()
      })

      function verify () {
        bagTools.verify(bag, {objectMode: true, test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          if (valid) t.ok(valid, `bag is valid`)
          else {
            // Lol, do warnings stuff
            t.skip(path.basename(bag))
          }
          next()
        })
      }
    }
  })
})

test('valid bags v1.0', function (t) {
  var version = 'v1.0'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '1.0', test: true, valid: true}, next)
    }
  })
})

test('invalid bags v1.0', function (t) {
  var version = 'v1.0'
  var dir = path.join(bagDir, version, 'invalid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '1.0', test: true, valid: false}, next)
    }
  })
})

test('valid bags v0.96', function (t) {
  var version = 'v0.96'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.96', test: true, valid: true}, next)
    }
  })
})

test('valid bags v0.95', function (t) {
  var version = 'v0.95'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.95', test: true, valid: true}, next)
    }
  })
})

test('valid bags v0.94', function (t) {
  var version = 'v0.94'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.94', test: true, valid: true}, next)
    }
  })
})

test('valid bags v0.93', function (t) {
  var version = 'v0.93'
  var dir = path.join(bagDir, version, 'valid')
  fs.readdir(dir, function (err, bags) {
    t.error(err, 'no error')
    next()

    function next () {
      var bag = bags.shift()
      if (!bag) return t.end()
      bag = path.join(dir, bag)
      testBag(t, bag, {version: '0.93', test: true, valid: true}, next)
    }
  })
})

function testBag (t, bag, opts, cb) {
  fs.stat(bag, function (err, stat) {
    if (err || !stat.isDirectory()) return cb()
    verify()
  })

  function verify () {
    opts.objectMode = true
    bagTools.verify(bag, opts, function (err, valid, results) {
      t.error(err, 'no error')
      t.same(valid, opts.valid, 'validation is correct')
      cb()
    })
  }
}
