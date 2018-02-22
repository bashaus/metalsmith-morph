const jstransformer = require('jstransformer');
const toTransformer = require('inputformat-to-jstransformer');

const cache = {};

module.exports = {
  get: function (extension) {
    if (extension in cache) {
        return cache[extension];
    }

    const transformer = toTransformer(extension);
    cache[extension] = transformer ? jstransformer(transformer) : false;

    return cache[extension];
  }
};
