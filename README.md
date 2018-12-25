# env-inject

通常前端项目都会有环境变量的需求，为此前端通常会以两种方式注入环境变量

- 构建时配置

这类通常在 webpack 构建时通过 CI 传入的环境值选择正确的环境变量替换项目代码中的环境变量

- 运行时配置

这类通常会把环境变量以 window 全局变量的形式在运行时注入到 html 页面中，后续以全局变量的方式访问环境变量

通常构建时配置很好用，不过构建时配置也有一些缺点，例如在 docker 中使用时由于环境变量不同产生预发布模式和线上环境生成的镜像不相同，增加构建时间的同时也增加了不确定风险，所以这个库使用的是运行时配置，且推荐了一套规范来帮助开发人员更好的在项目中使用环境变量

## 安装

```shell
npm i @kitten-team/env-inject
```

## 使用

1.准备你的环境配置文件，然后一定要记得将带有 local 的环境配置文件加入 git 忽略

```text
.env.local.*
.env.*.local.*
```

2.在准备好的项目 html 模板文件加入标记

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Page Title</title>
    <!-- <config-script></config-script> -->
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

3.在项目构建完毕，启动项目的文件顶部加入内容

```js
const envInject = require('@kitten-team/env-inject')
envInject({
  mode: 'staging' // 这里也可以使用环境变量啥的
})

// 项目启动代码开始...
```

## 原理及流程

1. 在项目 html 模板中加入标记
2. 开发过程 巴拉巴拉
3. docker 构建出项目
4. docker 项目启动时
5. 调用库收集当前环境变量
6. 自动遍历生成项目的 html 文件并替换锚点标记为 `<script>window.xxx = config</script>`
7. 项目运行

## 环境变量文件目录结构

你可以替换你的项目某个目录中的下列文件来指定环境变量：

```text
.env.json                # 在所有的环境中被载入
.env.local.json          # 在所有的环境中被载入，但会被 git 忽略
.env.[mode].json         # 只在指定的模式中被载入
.env.[mode].local.json   # 只在指定的模式中被载入，但会被 git 忽略
```

**_事实上，你 y 可以使用 js, json, yaml 格式的文件来定义你的环境变量_**

## 环境变量文件说明

通常环境变量分为两种，服务端的环境变量，客户端的环境变量

一个示例文件：

```yaml
# .env.yaml
server:
  PROT: 3000
  HOST: 127.0.0.1
client:
  overwrite: 1
  nested:
    a: 1
    b: 2
  # annotation: 3
```

通常服务端环境变量不会很多，所以为了方便，当没有顶层 server 字段及 client 字段时，所有字段均作为 client 字段

```yaml
# .env.dev.yaml
overwrite: 2
nested:
  b: 3
  c: 4
other: 5
```

这里有还有几点需要说明：

- 环境变量合并规则使用的是[lodash.merge](https://lodash.com/docs/4.17.10#merge)

- 服务端的环境变量不会最终注入到文件中，而是会注入到 process.env 里，所以建议使用大写定义

- 合并规则优先级`.env < .env.local < .env.[mode] < .env.[mode].local`

- 当没有 mode 指定时，只会最多取.env 及 .env.local 两个文件的值

所以上述两个文件在 mode 为 dev 时合并的最终结果为

```yaml
overwrite: 2
nested:
  a: 1
  b: 3
  c: 4
other: 5
```

同时还生成了 process.env.PROT 和 process.env.HOST 两个环境变量

## 与开发模式混合

由于这个库是修改生成的 html 代码，但是我们在开发时使用`webpack`及`html-webpack-plugin`，所以往往没有实体 html 生成，那么我们就需要在开发模式下进行类似混合

一个解决办法是在开发时  使用 html-webpack-plugin 注入代码，所以我们把我们的模板文件改为如下

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Page Title</title>
    <%= htmlWebpackPlugin.options.configScript %>
    <!-- <config-script></config-script> -->
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

然后修改我们的`webpack.config.js`

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const loadEnv = require('@kitten-team/env-inject').loadEnv
const config = loadEnv() //只调用内部loadEnv文件获得配置而不注入
const configScript =
  process.env.NODE_ENV === 'production'
    ? ''
    : `<script>window.CONFIG = ${JSON.stringify(config)}</script>`

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html',
      configScript
    })
  ]
}
```

所以聪明的你肯定已经明白了，在开发模式时由`html-webpack-plugin`注入配置，在生产模式时由`env-inject`注入配置，最终达到一样的混合效果

## 选项

### mode

类型： string

默认值： 无

 定义需要获取指定的模式/环境的配置

### markup

类型： string | RegExp

默认值： `<!-- <config-script></config-script> -->`

 标记点/锚点

### paths

类型: string[]

默认值: `[path.resolve(process.cwd(), './dist')]`

定义要替换的文件所在的目录，支持多个

### include

类型： string

默认值： `*.html`

 指定哪些文件参与替换过程，通常是 html 文件

### exclude

类型： string

默认值： 无

与 include 相反的功能

### key

类型: string

默认值: `CONFIG`

定义  挂载在 window 下的全局变量的 key

### dir

类型: string

默认值: `process.cwd()`

定义你的环境变量文件夹在哪儿

### extname

类型: string

默认值: `json`

定义你的环境变量文件使用的是什么格式，支持 js,json,yaml，很抱歉没做自动识别...

## 更新日志

[CHANGELOG.md](https://github.com/KittenTeam/env-inject/blob/master/CHANGELOG.md)
