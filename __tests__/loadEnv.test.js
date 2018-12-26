const path = require('path')
const loadEnv = require('../index').loadEnv

describe('expect loadEnv is a function', () => {
  expect(typeof loadEnv).toBe('function')
})

describe('test env dir', () => {
  test('env file no found ', () => {
    expect(loadEnv()).toEqual({})
  })
  test('found', () => {
    expect(
      loadEnv({
        dir: resolve('./mock')
      })
    ).toEqual({
      dir: 'mock'
    })
  })
})

describe('test env file extname', () => {
  const dir = resolve('./mock/extname')
  const extnames = ['js', 'json', 'yaml']
  test('', () => {
    extnames.forEach(extname => {
      expect(
        loadEnv({
          dir,
          extname
        })
      ).toEqual({ ext: extname })
    })
  })
})

describe('load env test', () => {
  const baseOption = {
    dir: resolve('./mock/env'),
    extname: 'yaml'
  }
  const baseResult = {
    overwrite: '.env.local',
    nested: {
      a: 1,
      b: 2
    }
  }
  test('load base', () => {
    const base = loadEnv(baseOption)
    expect(base).toEqual(baseResult)
    expect(process.env.HOST).toBe('127.0.0.1')
    expect(process.env.PORT).toBe('3000')
  })
  test('mode no exit', () => {
    expect(loadEnv({ ...baseOption, mode: 'staging' })).toEqual(baseResult)
  })

  test('config merge', () => {
    const dev = loadEnv({ ...baseOption, mode: 'dev' })
    expect(dev).toEqual({
      overwrite: '.env.dev.local',
      nested: {
        a: 1,
        b: 3,
        c: 4
      },
      other: 5
    })
  })
})

function resolve(dir) {
  return path.resolve(__dirname, dir)
}
