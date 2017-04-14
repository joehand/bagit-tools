# bagit-tools

collection of modules to manage BagIt bags

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

## Install

```
npm install bagit-tools
```

## Usage

```js
var bagitTools = require('bagit-tools')
```

### Verify Bag

```js
var bagDir = '/downloads/my-bag'
bagTools.verify(bagDir, function (err, valid, results) {
  if (err) throw err
  if (valid) console.log('VALID')
  else console.log('FAIL')
})
```

Results is an array of TAP test objects for each verification step. Run against the [LOC bagit-conformance-suite](https://github.com/LibraryOfCongress/bagit-conformance-suite) with `npm test`.

#### Bag Test Verification Status

* 1.0 - All passing
* 0.97 - Valid/Invalid Passing, Warnings need some work
* ... versions before 0.97 not tested

### Bag Fs

Read and write from bags with an fs-like API via [bagit-fs](https://github.com/joehand/bagit-fs).

```js
var bagFs = require('bagit-tools').fs
var bag = bagFs('/put/bag/here', 'sha256', {'Contact-Name': 'Joe Hand'})

// write files to bag's data folder
fs.createReadStream('readme.md').pipe(bag.createWriteStream('/readme.md'))

// ... LATER after all files are written
bag.finalize(function () {
  console.log('finalized')
})
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[MIT](LICENSE.md)

[npm-image]: https://img.shields.io/npm/v/bagit-tools.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/bagit-tools
[travis-image]: https://img.shields.io/travis/joehand/bagit-tools.svg?style=flat-square
[travis-url]: https://travis-ci.org/joehand/bagit-tools
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard
