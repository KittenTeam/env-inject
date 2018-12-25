const envInject = require('../index')
const loadEnv = require('../index').loadEnv
envInject({
  extname: 'js'
})
loadEnv({
  mode: 'a'
})
