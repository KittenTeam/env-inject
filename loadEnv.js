const fs = require('fs')
const path = require('path')
const merge = require('lodash.merge')

module.exports = function({
  dir = process.cwd(),
  mode,
  extname = 'json'
} = {}) {
  const context = { mode, dir, extname }
  // 加载顺序不能变，涉及到process.env
  const modeEnv = mode ? loadModeEnv(context, mode) : {}
  const baseEnv = loadModeEnv(context)
  return merge({}, baseEnv, modeEnv)
}

function loadModeEnv(context, mode) {
  const { dir, extname } = context
  const basePath = path.resolve(dir, `.env${mode ? `.${mode}` : ``}`)
  const localPath = `${basePath}.local`
  // 加载顺序不能变，涉及到process.env
  const localEnv = load(context, `${localPath}.${extname}`)
  const modeEnv = load(context, `${basePath}.${extname}`)
  return merge({}, modeEnv, localEnv)
}

function load(context, path) {
  try {
    const res = loadEnvFn(context, path)
    return res
  } catch (err) {
    return {}
  }
}

function loadEnvFn({ extname }, path) {
  let config
  switch (extname) {
    case 'js':
    case 'json':
      config = require(path)
      break
    case 'yaml':
      const yaml = require('js-yaml')
      config = yaml.safeLoad(fs.readFileSync(path, 'utf8'))
  }
  if (isPlainObject(config)) {
    if (config.server && isPlainObject(config.server)) {
      const server = config.server
      Object.keys(server).forEach(key => {
        if (typeof process.env[key] === 'undefined') {
          process.env[key] = server[key]
        }
      })
    }
    return config.client || config.server ? config.client : config
  }
  return {}
}

function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
