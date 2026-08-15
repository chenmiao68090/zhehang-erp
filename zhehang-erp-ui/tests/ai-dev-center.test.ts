import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const routes = readFileSync(new URL('../src/router/routes.ts', import.meta.url), 'utf8')
const retirementMigration = readFileSync(
  new URL('../../zhehang-erp-db/migration/V188_retire_ai_development_center.sql', import.meta.url),
  'utf8'
)

test('AI开发中心页面与接口已从前端源码退役', () => {
  assert.equal(existsSync(new URL('../src/views/ai-dev/index.vue', import.meta.url)), false)
  assert.equal(existsSync(new URL('../src/api/ai-dev.ts', import.meta.url)), false)
})

test('AI开发中心历史深链统一回首页且不再加载业务组件', () => {
  assert.match(routes, /path: '\/ai-dev\/:pathMatch\(\.\*\)\*', redirect: '\/'/)
  assert.doesNotMatch(routes, /component:\s*\(\)\s*=>\s*import\(['"]@\/views\/ai-dev/)
})

test('V188精确撤销菜单授权并保留历史业务表', () => {
  assert.match(retirementMigration, /DELETE FROM `sys_role_menu`/)
  assert.match(retirementMigration, /SET `visible` = 0,[\s\S]*`deleted` = 1/)
  assert.match(retirementMigration, /perms` LIKE 'ai_dev:%'/)
  assert.doesNotMatch(retirementMigration, /DROP TABLE/i)
})
