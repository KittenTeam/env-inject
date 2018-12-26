const path = require('path')
const fs = require('fs')
const envInject = require('../index')

const sourceIndexPath = resolve('./mock/dist/index.html')
const sourceIndexHtml = readFileSync(sourceIndexPath)
const sourceNestedPath = resolve('./mock/dist/nested/nested.html')
const sourceNestedHtml = readFileSync(sourceNestedPath)
const sourceregx = /<!-- <config-script><\/config-script> -->/
describe('test inject', () => {
  test('source html have markup', () => {
    expect(sourceregx.test(sourceIndexHtml)).toBe(true)
    expect(sourceregx.test(sourceNestedHtml)).toBe(true)
  })
  envInject({
    dir: resolve('./mock'),
    paths: [resolve('./mock/dist')]
  })
  const resIndexHtml = readFileSync(sourceIndexPath)
  const resNestedHtml = readFileSync(sourceNestedPath)
  const resReg = /<script>window.CONFIG = {"dir":"mock"}<\/script>/
  test('markup is replaced with config script', () => {
    expect(sourceregx.test(resIndexHtml)).toBe(false)
    expect(sourceregx.test(resNestedHtml)).toBe(false)

    expect(resReg.test(resIndexHtml)).toBe(true)
    expect(resReg.test(resNestedHtml)).toBe(true)
  })
  writeFileSync(sourceIndexPath, sourceIndexHtml)
  writeFileSync(sourceNestedPath, sourceNestedHtml)
})

function resolve(dir) {
  return path.resolve(__dirname, dir)
}

function readFileSync(path) {
  return fs.readFileSync(path, 'utf-8')
}

function writeFileSync(path, data) {
  return fs.writeFileSync(path, data, 'utf-8')
}
