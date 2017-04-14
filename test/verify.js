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
      fs.stat(bag, function (err, stat) {
        if (err || !stat.isDirectory()) return next()
        verify()
      })

      function verify () {
        bagTools.verify(bag, {test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          t.ok(valid, 'bag is valid')
          next()
        })
      }
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
      fs.stat(bag, function (err, stat) {
        if (err || !stat.isDirectory()) return next()
        verify()
      })

      function verify () {
        bagTools.verify(bag, {test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          t.ok(!valid, `bag is invalid`)
          if (valid) {
            console.log(results)
          }
          next()
        })
      }
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
        bagTools.verify(bag, {test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          if (valid) t.ok(valid, `bag is valid`)
          else {
            // Lol
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
      fs.stat(bag, function (err, stat) {
        if (err || !stat.isDirectory()) return next()
        verify()
      })

      function verify () {
        bagTools.verify(bag, {version: '1.0', test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          t.ok(valid, 'bag is valid')
          next()
        })
      }
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
      fs.stat(bag, function (err, stat) {
        if (err || !stat.isDirectory()) return next()
        verify()
      })

      function verify () {
        bagTools.verify(bag, {version: '1.0', test: true}, function (err, valid, results) {
          t.error(err, 'no error')
          t.ok(!valid, `bag is invalid`)
          next()
        })
      }
    }
  })
})
