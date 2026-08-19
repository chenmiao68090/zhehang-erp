import { readFileSync, readdirSync } from 'node:fs'

const moduleDir = new URL('../src/router/module-routes/', import.meta.url)

/** 抓取 module-routes/*.ts 里每个 `export const X: RouteRecordRaw[] = [ ... ]` 的数组体。 */
function collectModuleBodies(): Map<string, string[]> {
  const bodies = new Map<string, string[]>()
  for (const file of readdirSync(moduleDir)) {
    if (!file.endsWith('.ts')) continue
    const lines = readFileSync(new URL(file, moduleDir), 'utf8').split('\n')
    let name: string | null = null
    let start = -1
    lines.forEach((line, index) => {
      const open = line.match(/^export const (\w+): RouteRecordRaw\[\] = \[$/)
      if (open) {
        name = open[1]
        start = index + 1
        return
      }
      if (name && line === ']') {
        bodies.set(name, lines.slice(start, index))
        name = null
      }
    })
  }
  return bodies
}

/**
 * 路由定义已按业务域拆分到 src/router/module-routes/*.ts，routes.ts 只留导航分组常量与合并顺序。
 * 这里把 routes.ts 里的 `...xxxRoutes` 原地展开成对应模块的数组体，还原出与拆分前等价的
 * 完整路由源码文本（内容和先后顺序都不变），基于源码文本的断言因此不用关心文件怎么分。
 */
export function readRouterSource(): string {
  const bodies = collectModuleBodies()
  return readFileSync(new URL('../src/router/routes.ts', import.meta.url), 'utf8')
    .split('\n')
    .flatMap((line) => {
      const spread = line.match(/^ {2}\.\.\.(\w+),?$/)
      const body = spread ? bodies.get(spread[1]) : undefined
      return body ?? [line]
    })
    .join('\n')
}
