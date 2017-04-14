var path = require('path')
var low = require('last-one-wins')
var fs = require('fs')
var EOL = require('os').EOL
var debug = require('debug')('bagit')

module.exports = FileDb

/**
 * BagIt File Db Manager
 * Modified from toiletdb https://github.com/maxogden/toiletdb
 * Uses newline delimited <key>: <val>
 */
function FileDb (filename) {
  // in memory copy of latest state that functions below mutate
  var state = {}
  var isManifest = (path.basename(filename).indexOf('manifest') > -1)

  // `low` ensures if write is called multiple times at once the last one will be executed
  // last and call the callback. this works OK because we have `state` above
  var write = low(function (writeState, cb) {
    // TODO: preserve key order (bagit 1.0 addition?)
    var payload = Object.keys(state).map(function (key) {
      if (isManifest) return `${state[key]} ${key}` // write filename === key second
      return `${key}: ${state[key]}`
    }).join(EOL)
    debug('writing', filename, payload)

    // write to tempfile first so we know it fully writes to disk and doesnt corrupt existing file
    var tmpname = filename + '.' + Math.random()
    fs.writeFile(tmpname, payload, function (err) {
      if (err) {
        return fs.unlink(tmpname, function () {
          cb(err)
        })
      }
      fs.rename(tmpname, filename, cb)
    })
  })

  return {
    read: function (cb) {
      debug('read')
      fs.readFile(filename, function (err, buf) {
        if (err) {
          if (err.code === 'ENOENT') {
            // if you read before ever writing
            return cb(null, state)
          } else {
            return cb(err)
          }
        }
        try {
          // db needs to fit in a single string
          var stringData = buf.toString()
          debug('reading', filename, stringData)

          // TODO: preserve order
          var data = {}
          stringData.split(EOL).map(function (line) {
            line = line.split(' ')
            line[0] = line[0].replace(/:$/, '')
            debug('data', isManifest, line[0], line[1])
            if (isManifest) {
              data[line[1]] = line[0]
              return
            }
            // remove ':' for bag-info key
            data[line[0]] = line[1]
          })

          return cb(null, data)
        } catch (e) {
          return cb(e)
        }
      })
    },
    write: function (key, data, cb) {
      if (Buffer.isBuffer(key)) key = key.toString('hex')
      if (Buffer.isBuffer(data)) data = data.toString('hex')

      state[key] = data
      write(state, cb)
    },
    delete: function (key, cb) {
      if (Buffer.isBuffer(key)) key = key.toString('hex')
      delete state[key]
      write(state, cb)
    }
  }
}
