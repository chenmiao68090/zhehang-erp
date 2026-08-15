import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const routes = readFileSync(new URL('../src/router/routes.ts', import.meta.url), 'utf8')
const permissionStore = readFileSync(new URL('../src/stores/permission.ts', import.meta.url), 'utf8')
const rolePermission = readFileSync(new URL('../src/views/system/role-permission.vue', import.meta.url), 'utf8')
const breadcrumb = readFileSync(new URL('../src/components/layout/Breadcrumb.vue', import.meta.url), 'utf8')
const messageView = readFileSync(new URL('../src/views/message/center.vue', import.meta.url), 'utf8')
const notificationEntry = readFileSync(new URL('../src/components/MessageCenter.vue', import.meta.url), 'utf8')
const imStore = readFileSync(new URL('../src/stores/im.ts', import.meta.url), 'utf8')

test('内部沟通归入首页左侧目录，不再占用顶部一级模块', () => {
  assert.doesNotMatch(routes, /\{ name: '内部沟通', icon: 'ChatDotRound'/)
  assert.match(routes, /'\/message': '首页'/)
  assert.doesNotMatch(routes, /'\/message': '内部沟通'/)
  assert.match(routes, /path: '\/'[\s\S]*?path: '\/message'[\s\S]*?path: '\/dashboard'/)
})

test('页面、菜单、面包屑和顶部提醒统一命名为内部沟通', () => {
  assert.match(routes, /meta: \{ title: '内部沟通', icon: 'ChatDotRound' \}/)
  assert.match(routes, /name: 'MessageCenterPage'[\s\S]*?title: '内部沟通'[\s\S]*?breadcrumb: false/)
  assert.match(messageView, /<h1>内部沟通<\/h1>/)
  assert.match(notificationEntry, /进入内部沟通/)
  assert.match(breadcrumb, /item\.meta\?\.breadcrumb !== false/)
})

test('内部沟通保持全员基础可见，不要求改写角色数据', () => {
  assert.match(routes, /ALWAYS_VISIBLE_GROUPS = new Set<string>\(\['首页'\]\)/)
  assert.match(permissionStore, /ALWAYS_VISIBLE_GROUPS\.has\(group\)/)
  assert.match(rolePermission, /首页（含内部沟通）始终可见/)
  assert.match(rolePermission, /!ALWAYS_VISIBLE_GROUPS\.has\(g\.name\)/)
})

test('历史地址、铃铛和实时消息深链仍使用 /message/center', () => {
  assert.match(routes, /redirect: '\/message\/center'/)
  assert.match(notificationEntry, /path: '\/message\/center'/)
  assert.match(imStore, /window\.location\.href = `\/message\/center\?conversationId=/)
})
