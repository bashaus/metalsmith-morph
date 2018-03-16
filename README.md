# metalsmith-morph

[![npm version][img:npm]][url:npm]
[![build status][img:build-status]][url:build-status]

> A jstransformer template engine for metalsmith

This [metalsmith][url:metalsmith] plugin allows you to render templates with
[jstransformer][url:jstransformer]. The plugin exposes two properties:
`templatePath` and `destinationPath` to help with linking between pages.

The `templatePath` refers to the main template being transformed (e.g.
`index.html.njk`). The `destinationPath` refers to the name of the output file
after all transformations have been rendered (e.g.: `index.html`). The variable
names are borrowed from yeoman.

Files will be transformed based on their extension, last extension first.
Transformations are applied until there are no more applicable jstransformers
remaining.

## Templating engines

You can use any jstransformer-compatible engine to render output including:

* [Nunjucks][url:jstransformer-nunjucks]
* [Handlebars][url:jstransformer-handlebars]
* [Markdown][url:jstransformer-markdown]
* ... and [hundreds more official jstransformers][url:jstransformers]

## Example

The following example shows you how to use `jstransformer-nunjucks` with
`metalsmith-morph`.

```bash
npm install metalsmith metalsmith-morph jstransformer-nunjucks --save
```

```javascript
var metalsmith = require('metalsmith')
var morph = require('metalsmith-morph')

metalsmith(__dirname)
  .use(morph())
  .build(function(err){
    if (err) throw err;
  });
```

Source file `src/index.html.njk`:

```html
---
title: Page title
---
<p>{{ title }} ({{ destinationPath }})</p>
```

Results in `build/index.html`:

```html
<p>Page title (index.html)</p>
```

## Options

You can pass additional options to a jstransformer engine by using the options
parameter. The first key in the object is the name of the transformer (in this
example, nunjucks).

The following example exposes node's `require` function in nunjucks so that it
may be used inside a template:

```javascript
var metalsmith = require('metalsmith')
var morph = require('metalsmith-morph')

metalsmith(__dirname)
  .use(morph({
    nunjucks: {
      globals: {
        require: function () { return require.apply(this, arguments) }
      }
    }
  }))
  .build(function(err){
    if (err) throw err;
  });
```

Implementation example:

```html
{% set path = require('path') -%}
{{ path.parse('http://www.example.com') | dump | safe }}
```

## Acknowledgements

This project draws significant inspiration from
[metalsmith-in-place][url:metalsmith-in-place] and
[metalsmith-engine-jstransformer][url:metalsmith-engine-jstransformer].

The main difference is that metalsmith-morph is a single plugin which exposes
`destinationPath` and `templatePath`.



[url:metalsmith]: http://www.metalsmith.io/
[url:metalsmith-engine-jstransformer]: https://github.com/superwolff/metalsmith-engine-jstransformer
[url:metalsmith-in-place]: https://github.com/superwolff/metalsmith-in-place
[url:jstransformers]: https://github.com/jstransformers
[url:jstransformer]: https://github.com/jstransformers/jstransformer
[url:jstransformer-nunjucks]: https://github.com/jstransformers/jstransformer-nunjucks
[url:jstransformer-handlebars]: https://github.com/jstransformers/jstransformer-handlebars
[url:jstransformer-markdown]: https://github.com/jstransformers/jstransformer-markdown

[img:build-status]: https://travis-ci.org/bashaus/metalsmith-morph.svg
[url:build-status]: https://travis-ci.org/bashaus/metalsmith-morph

[img:npm]: https://img.shields.io/npm/v/metalsmith-morph.svg
[url:npm]: https://www.npmjs.com/package/metalsmith-morph
