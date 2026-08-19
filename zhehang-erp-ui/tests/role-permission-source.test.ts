import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { readRouterSource } from './router-source.ts'

const permissionStore = readFileSync(new URL('../src/stores/permission.ts', import.meta.url), 'utf8')
const userStore = readFileSync(new URL('../src/stores/user.ts', import.meta.url), 'utf8')
const rolePage = readFileSync(new URL('../src/views/system/role-permission.vue', import.meta.url), 'utf8')
const employeePage = readFileSync(new URL('../src/views/org/employee.vue', import.meta.url), 'utf8')
const systemApi = readFileSync(new URL('../src/api/system.ts', import.meta.url), 'utf8')
const routes = readRouterSource()

test('角色管理 visible_modules 是页面导航唯一来源', () => {
  assert.doesNotMatch(permissionStore, /menuApi\.getRouters/)
  assert.doesNotMatch(permissionStore, /filterAsyncRoutes\(asyncRoutes/)
  assert.match(permissionStore, /filterByVisibleModules\(asyncRoutes, userStore\.visibleModules\)/)
  assert.match(permissionStore, /filterByVisibleModules\(constantRoutes, userStore\.visibleModules\)/)
  assert.match(rolePage, /员工页面导航的唯一配置来源/)
})

test('可见模块空数组失败收紧，只有 null 表示全部', () => {
  assert.match(permissionStore, /if \(visibleModules === null\) return routes/)
  assert.match(permissionStore, /if \(!visibleModules\.length\)/)
  assert.match(userStore, /空数组代表无业务模块/)
  assert.match(userStore, /data\.visibleModules === null/)
  assert.match(userStore, /Array\.isArray\(data\.visibleModules\) \? data\.visibleModules : \[\]/)
})

test('唯一超级管理员配置只读且仍可维护成员', () => {
  assert.match(rolePage, /const READONLY_ROLE_KEYS = \['super_admin'\]/)
  assert.match(rolePage, /唯一超级管理员拥有全部查看权限/)
  assert.match(rolePage, /可在上方维护成员/)
})

test('角色成员只保留顶部摘要和右侧抽屉一个管理入口', () => {
  assert.match(rolePage, /class="rp-members-summary"/)
  assert.match(rolePage, /@click="openMemberDrawer">成员管理/)
  assert.match(rolePage, /<el-drawer[\s\S]*v-model="memberDrawerVisible"/)
  assert.match(rolePage, /这里仅调整该角色包含的员工，不会改变角色本身的权限配置/)
  assert.doesNotMatch(rolePage, /class="rp-members-block"/)
})

test('页面、操作、数据范围由角色管理一次保存', () => {
  assert.match(rolePage, /③ 可使用的操作（按钮和接口）/)
  assert.match(rolePage, /menuIds: buildMenuIdsForSave\(\)/)
  assert.match(rolePage, /roleApi\.savePermissionSettings/)
  assert.match(systemApi, /savePermissionSettings: \(data: \{ roleId: number; dataScope: number; visibleModules: string \| null; menuIds: number\[\] \}\)/)
  assert.doesNotMatch(systemApi, /assignMenus|setVisibleModules|\/system\/role\/dataScope|\/system\/role\/visibleModules/)
})

test('员工页不再提供第二套角色写入口', () => {
  assert.match(employeePage, /角色及权限唯一在「角色管理」维护/)
  assert.match(employeePage, /前往角色管理/)
  assert.match(employeePage, /delete payload\.roleIds/)
  assert.doesNotMatch(employeePage, /v-model="form\.roleIds"/)
})

test('历史权限链接统一跳转角色管理且旧页面已移除', () => {
  assert.match(routes, /path: 'permission'[\s\S]*redirect: '\/sys-org\/role'/)
  assert.doesNotMatch(routes, /import\('@\/views\/system\/permission-setting\.vue'\)/)
})
