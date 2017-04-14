var fs = require('fs')
var crypto = require('crypto')
var path = require('path')
var split = require('split2')
var transform = require('unordered-parallel-transform')
var concat = require('concat-stream')
var countFiles = require('count-files')
var pump = require('pump')
var iconv = require('iconv-lite')
var debug = require('debug')('bagit')

module.exports = Manifest

// Parallel hash verifcations
var PARALLEL = 20

/**
 * BagIt Manifest Manager
 */
function Manifest (file, opts) {
  if (!(this instanceof Manifest)) return new Manifest(file, opts)
  if (!opts) opts = {}

  this.file = file // TODO: make sure this is resolvable path
  this.name = path.basename(file)
  this.dir = path.dirname(file)
  this.isManifest = (path.basename(file).indexOf('manifest') > -1)
  this.algorithm = path.basename(file, '.txt').split('-')[1]
  this.encoding = opts.encoding // TODO: required?
}

Manifest.prototype.verify = function (cb) {
  var self = this
  var results = []
  var errors = []
  debug('verify()', self.name)

  pump(self.read(), transform(PARALLEL, checkHash), concat(parseResults), function (err) {
    if (err) return cb(err)
    cb(null, results, errors)
  })

  function parseResults (data) {
    results = data
    errors = data.filter(function (item) {
      return !item.ok
    })
  }

  function checkHash (entry, cb) {
    debug('checkHash', entry)
    var file = path.join(self.dir, entry[1])
    var expectedHash = entry[0]

    fs.stat(file, function (err, stat) {
      if (err) return done(err)
      if (!stat.isFile()) return done('not a file')

      var hash = crypto.createHash(self.algorithm)
      var rs = fs.createReadStream(file)
      hash.setEncoding('hex')

      pump(rs, hash, function (err) {
        if (err) return done(err)
        hash.end()
        done()
      })

      function done (err) {
        var result = {ok: false, file: entry[1]}
        if (err || !hash) return cb(null, result) // fail verification
        result.hash = hash.read()
        debug('hashes', result.hash, expectedHash)
        if (result.hash !== expectedHash) return cb(null, result)
        result.ok = true
        cb(null, result)
      }
    })
  }
}

Manifest.prototype.verifyLength = function (fileCount, cb) {
  var self = this
  if (fileCount) return verify()
  countFiles(path.join(self.dir, 'data'), function (err, count) {
    if (err) return cb(err)
    fileCount = count.files
    verify()
  })

  function verify () {
    // TODO: not this lol
    if (!self.entryCount) return cb(new Error('do hash verification first'))

    debug(`verifyLength() fileCount: ${fileCount}, entryCounty ${self.entryCount}`)
    cb(null, fileCount === self.entryCount)
  }
}

Manifest.prototype.read = function (cb) {
  var self = this
  if (!self.entryCount) self.entryCount = 0
  var rs = fs.createReadStream(this.file, {encoding: 'binary'})

  return rs
    .pipe(split(function (row) {
      self.entryCount++
      if (!iconv.encodingExists(self.encoding)) return row
      row = iconv.decode(row, self.encoding)
      return [ row.substr(0, row.indexOf(' ')), row.substr(row.indexOf(' ') + 1).trim() ]
    }))
    .on('close', function () {
      rs.destroy()
    })
}
