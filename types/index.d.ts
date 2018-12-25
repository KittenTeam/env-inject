interface Context {
  /**
   * 定义需要获取的环境配置的环境名称
   */
  mode?: string
  /**
   * 标记点/锚点
   */
  markup?: string | RegExp
  /**
   * 定义要替换的文件所在的目录，支持多个
   */
  paths?: string[]
  /**
   * 指定哪些文件参与替换过程，通常是 html 文件
   */
  include?: string
  /**
   * 指定哪些文件不参与替换过程，与include相反
   */
  exclude?: string
  /**
   * 定义  挂载在 window 下的全局变量的 key
   */
  key?: string
  /**
   * 定义你的环境变量文件夹在哪儿
   */
  dir?: string
  /**
   * 定义你的环境变量文件使用的是什么格式，支持 js,json,yaml
   */
  extname?: 'js' | 'json' | 'yaml'
}

/**
 * 将环境变量注入html文件中
 * @param context
 */
declare function envInject(context?: Context): void
declare namespace envInject {
  /**
   * 只加载环境变量而不注入文件中
   * @param context
   */
  export function loadEnv(context?: Context): object
}
export = envInject
