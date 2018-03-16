const isUTF8 = require('is-utf8')
const extend = require('extend');

const Transformers = require('./Transformers.js');

module.exports = function (engineOptions) {
  engineOptions = engineOptions || {};

  return function(files, metalsmith, done) {
    setImmediate(done);

    function findTransformers(filename, file) {
      file.templatePath = filename;
      file.destinationPath = filename;
      file.transformers = [];

      // Split filename and extensions
      const inParts = filename.split('.');
      let outParts = [inParts.shift()];

      // Loop through all extensions
      while (inParts.length > 0) {
        const extension = inParts.pop();
        const transformer = Transformers.get(extension);

        // If the current extension can't be transformed stop looping
        if (!transformer) {
          outParts = outParts.concat(inParts);
          outParts.push(extension);
          break;
        }

        // If the last extension was transformed, replace it with a new one
        if (inParts.length === 0) {
          outParts.push(transformer.outputFormat);
        }

        // Add the transformer
        file.transformers.push(transformer);
      }

      file.destinationPath = outParts.join('.');
    }

    function applyTransformers(filename, file) {
      const metadata = extend({}, metalsmith.metadata(), file);

      // Transform the file from a buffer to a String
      file.contents = file.contents.toString();

      // Run the transformers
      file.transformers.forEach(transform => {
        file.contents = transform.render(
          file.contents,
          engineOptions[transform.name],
          metadata
        ).body;
      });

      // Convert contents back to a Buffer
      file.contents = new Buffer(file.contents);

      // Save the file under the destinationPath
      if (file.destinationPath !== file.templatePath) {
        files[file.destinationPath] = files[file.templatePath];
        delete files[file.templatePath];
      }
    }

    Object.keys(files)
      .filter(filename => isUTF8(files[filename].contents))
      .filter(filename => {
        findTransformers(filename, files[filename]);
        return files[filename].transformers.length !== 0;
      })
      .map(filename => {
        applyTransformers(filename, files[filename]);
      });
  }
}
