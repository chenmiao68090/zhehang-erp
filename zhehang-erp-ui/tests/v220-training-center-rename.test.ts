import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { readRouterSource } from './router-source.ts'

const routes = readRouterSource()
const catalog = readFileSync(new URL('../src/views/feige-suite/catalog.ts', import.meta.url), 'utf8')

test('飞哥学习分组统一显示为培训中心', () => {
  assert.match(routes, /\{ name: '培训中心', icon: 'Reading'/)
  assert.match(routes, /'\/feige-learning': '培训中心'/)
  assert.match(catalog, /code: 'learning', title: '培训中心', basePath: '\/feige-learning'/)
})

test('改名不改学习模块路由，不保留旧显示名', () => {
  assert.match(routes, /'\/feige-learning'/)
  assert.match(catalog, /basePath: '\/feige-learning'/)
  assert.doesNotMatch(routes, /学习体系/)
  assert.doesNotMatch(catalog, /学习体系/)
})
