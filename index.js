const path = require('path')
const replace = require('replace')
const loadEnv = require('./loadEnv')

module.exports = function(context = {}) {
  const config = loadEnv(context)
  const {
    markup = '<!-- <config-script></config-script> -->',
    paths = [path.resolve(process.cwd(), './dist')],
    include = '*.html',
    exclude,
    key = 'CONFIG'
  } = context
  const inject = `<script>window.${key} = ${JSON.stringify(config)}</script>`
  replace({
    regex: markup,
    replacement: inject,
    paths,
    include,
    exclude,
    recursive: true
  })
  return config
}
