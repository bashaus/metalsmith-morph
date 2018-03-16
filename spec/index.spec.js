const Metalsmith = require('metalsmith')
const morph = require('../lib/index.js')
const assertDirEqual = require('assert-dir-equal')

function initMetalsmith(fixture) {
  return Metalsmith(__dirname + '/fixtures/' + fixture + '/')
    .source('./source')
    .destination('./actual')
}

function getExpectedDirectory(fixture) {
  return __dirname + '/fixtures/' + fixture + '/expected/'
}

describe('prepare', function() {
  it('transforms single extensions', done => {
    const metalsmith = initMetalsmith('single-extension')

    metalsmith
      .use(files => expect(Object.keys(files)).toEqual(['index.html.njk']))
      .use(morph())
      .use(files => {
        expect(Object.keys(files)).toEqual(['index.html'])
        expect(files['index.html'].templatePath).toEqual('index.html.njk')
        expect(files['index.html'].destinationPath).toEqual('index.html')
      })
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('single-extension'), metalsmith.destination())
        done()
      })
  })

  it('transforms multiple extensions', done => {
    const metalsmith = initMetalsmith('multiple-extensions')

    metalsmith
      .use(files => expect(Object.keys(files)).toEqual(['index.html.md.njk']))
      .use(morph())
      .use(files => expect(Object.keys(files)).toEqual(['index.html']))
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('multiple-extensions'), metalsmith.destination())
        done()
      })
  })

  it('skips non-utf8 files', done => {
    const metalsmith = initMetalsmith('skips-non-utf8')

    metalsmith
      .use(morph())
      .use(files => expect(files['blue-square.png'].transformers).not.toBeDefined())
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('skips-non-utf8'), metalsmith.destination())
        done()
      })
  })

  it('accepts options', done => {
    const metalsmith = initMetalsmith('accepts-options')

    metalsmith
      .use(morph({
        nunjucks: {
          globals: {
            makeUpperCase: function (str) { return str.toUpperCase() }
          }
        }
      }))
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('accepts-options'), metalsmith.destination())
        done()
      })
  })

  it('includes metadata', done => {
    const metalsmith = initMetalsmith('includes-metadata')
    const collections = require('metalsmith-collections')

    metalsmith
      .use(collections({
        all_files: {
          pattern: "**/*.html.njk"
        }
      }))
      .use(morph())
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('includes-metadata'), metalsmith.destination())
        done()
      })
  })


  it('replaces filenames', done => {
    const metalsmith = initMetalsmith('replace-file-extension')
    const collections = require('metalsmith-collections')

    metalsmith
      .use(collections({
        all_files: {
          pattern: "**/*.html.njk"
        }
      }))
      .use(morph())
      .build(err => {
        if (err) throw err
        assertDirEqual(getExpectedDirectory('replace-file-extension'), metalsmith.destination())
        done()
      })
  })
})
