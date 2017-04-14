var assert = require('assert')
var fs = require('fs')
var path = require('path')
var waterfall = require('run-waterfall')
var test = require('tape')
var collect = require('collect-stream')
var countFiles = require('count-files')
var Manifest = require('./manifest')
var fileDb = require('./file-db')

module.exports = verify

var VERSION = '0.97'
var BAGIT_KEYS = {
  'version': 'BagIt-Version',
  'encoding': 'Tag-File-Character-Encoding'
}

function verify (bagDir, opts, cb) {
  if (typeof opts === 'function') cb = opts
  assert.equal(typeof bagDir, 'string', 'verify: bagDir require, should be string')
  assert.ok(cb, 'verify: callback required')

  var version = opts.version || VERSION
  var fileEncoding
  var htest = test
  if (opts.test) htest = test.createHarness()

  collect(htest.createStream({ objectMode: true }), function (err, results) {
    if (err) return cb(err)
    var errors = results.filter(function (result) {
      return result.type === 'assert' && !result.ok
    })
    cb(null, !errors.length, results)
  })

  htest('bagit.txt file', function (t) {
    var file = path.join(bagDir, 'bagit.txt')
    fs.stat(file, function (err) {
      if (err) {
        t.error(err, 'no bagit.txt file')
        return t.end()
      }
      var db = fileDb(file)
      db.read(function (err, data) {
        if (err) return cb(err) // maybe code failure, not test failure
        var bagVersion = data[BAGIT_KEYS['version']]

        t.same(bagVersion && bagVersion.trim(), version, 'bagit version okay')
        // TODO: check encoding is correct
        t.ok(data[BAGIT_KEYS['encoding']], 'bagit encoding okay')
        fileEncoding = data[BAGIT_KEYS['encoding']]
        t.end()
      })
    })
  })

  htest('manifest files', function (t) {
    var manifests
    var fileCount
    var regex = /manifest-.*\.txt/

    fs.readdir(bagDir, function (err, entries) {
      if (err) return cb(err)
      manifests = entries.filter(function (entry) {
        return regex.test(entry)
      })

      // count once for all manifest files
      countFiles(path.join(bagDir, 'data'), function (err, count) {
        if (err) return cb(err)
        fileCount = count.files
        runTasks()
      })
    })

    function runTasks () {
      // Verify each manifest (payload + tags)
      var tasks = []
      manifests = manifests.map(function (file) {
        var manifest = Manifest(path.join(bagDir, file), {encoding: fileEncoding})
        tasks.push(function (cb) {
          verify(manifest, cb)
        })
        return manifest
      })

      function verify (manifest, cb) {
        manifest.verify(function (err, results, errors) {
          if (err) return cb(err)
          // TODO: May be a better way to return these results?
          t.ok(results, `${manifest.name} results`) // pass results through
          t.ok(errors.length === 0, `${manifest.name} no verification errors`)

          // Skip length verification for tags rn
          if (manifest.name.indexOf('tag') > -1) return cb()

          // verify manifest entries = file count
          manifest.verifyLength(fileCount, function (err, lengthOk) {
            if (err) return cb(err)
            t.ok(lengthOk, 'entries match file count')
            cb()
          })
        })
      }

      waterfall(tasks, function (err) {
        if (err) return cb(err)
        t.end()
      })
    }
  })
}
