const isUTF8 = require('is-utf8')
const jstransformer = require('jstransformer')
const toTransformer = require('inputformat-to-jstransformer')

const transformerCache = {}

function getTransformer(extension) {
  if (extension in transformerCache) return transformerCache[extension]

  const transformer = toTransformer(extension)
  transformerCache[extension] = transformer ? jstransformer(transformer) : false

  return transformerCache[extension]
}

function prepareFile(filename, file) {
  file.templatePath = filename
  file.destinationPath = filename
  file.transformers = []

  return new Promise((resolve, reject) => {
    if (!isUTF8(file.contents)) {
      return resolve()
    }

    // Split filename and extensions
    const inParts = filename.split('.')
    let outParts = [inParts.shift()]

    // Loop through all extensions
    while (inParts.length > 0) {
      const extension = inParts.pop()
      const transformer = getTransformer(extension)

      // If the current extension can't be transformed stop looping
      if (!transformer) {
        outParts = outParts.concat(inParts)
        outParts.push(extension)
        break
      }

      // If the last extension was transformed, replace it with a new one
      if (inParts.length === 0) {
        outParts.push(transform.outputFormat)
      }

      // Add the transformer
      file.transformers.push(transformer)
    }

    file.destinationPath = outParts.join('.')

    return resolve()
  })
}

module.exports = function (engineOptions) {
  engineOptions = engineOptions || {}

  return function(files, metalsmith, done) {
    Promise.all(
      Object.keys(files).map(filename => {
         prepareFile(filename, files[filename])
      })
    ).then(() => {
      return Promise.all(
        Object.keys(files)
          .filter(filename => {
            // If there are no transformers, do nothing
            return files[filename].transformers.length !== 0
          })
          .map(filename => {
            const file = files[filename]

            return new Promise((resolve, reject) => {
              // Transform the file
              file.contents = file.contents.toString()

              for (let i = 0; i < file.transformers.length; i += 1) {
                const transform = file.transformers[i]
                file.contents = transform.render(
                  file.contents,
                  engineOptions[transform.name],
                  file
                ).body
              }

              file.contents = new Buffer(file.contents)

              // Save the file under the destinationPath
              if (file.destinationPath !== file.templatePath) {
                files[file.destinationPath] = files[file.templatePath]
                delete files[file.templatePath]
              }

              return resolve()
            })
          })
      )
    }).then(() => { done() })
  }
}
