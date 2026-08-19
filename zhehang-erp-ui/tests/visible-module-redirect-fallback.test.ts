import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { filterRoutesByVisibleModules } from '../src/router/visible-module-filter.ts'

const MODULE_GROUP = { '/seal': '印章体系' }
const ALWAYS_VISIBLE: ReadonlySet<string> = new Set()

/** 与 sealRoutes 同形：redirect 指向 board，销售角色只被放行 order。 */
function sealLike() {
  return [
    {
      path: '/seal',
      redirect: '/seal/board',
      children: [
        { path: 'board' },
        { path: 'order' },
        { path: 'cost' },
        { path: 'submit', meta: { hidden: true } }
      ]
    }
  ]
}

test('只放行子页时父路由 redirect 回落到第一个可见子页', () => {
  const [seal] = filterRoutesByVisibleModules(sealLike(), ['/seal/order'], MODULE_GROUP, {}, ALWAYS_VISIBLE)
  assert.equal(seal.redirect, '/seal/order')
  assert.deepEqual(seal.children?.map((c) => c.path), ['order', 'submit'])
})

test('redirect 目标本身可见时保持原落地页不变', () => {
  const [seal] = filterRoutesByVisibleModules(
    sealLike(), ['/seal/board', '/seal/order'], MODULE_GROUP, {}, ALWAYS_VISIBLE
  )
  assert.equal(seal.redirect, '/seal/board')
})

test('整个大类被放行时不改写 redirect', () => {
  const [seal] = filterRoutesByVisibleModules(sealLike(), ['印章体系'], MODULE_GROUP, {}, ALWAYS_VISIBLE)
  assert.equal(seal.redirect, '/seal/board')
  assert.equal(seal.children?.length, 4)
})

test('visibleModules 为 null（管理员）时路由原样返回', () => {
  const routes = sealLike()
  assert.equal(filterRoutesByVisibleModules(routes, null, MODULE_GROUP, {}, ALWAYS_VISIBLE), routes)
})

test('redirect 指向模块外的落地页时不被改写', () => {
  const [order] = filterRoutesByVisibleModules(
    [{
      path: '/order',
      redirect: '/feige-order-contract/orders',
      children: [{ path: 'list' }, { path: 'bill' }]
    }],
    ['/order/bill'],
    { '/order': '提单中心' },
    {},
    ALWAYS_VISIBLE
  )
  assert.equal(order.redirect, '/feige-order-contract/orders')
})

test('刻章提单确实是印章体系下 redirect 之外的子页', () => {
  const misc = readFileSync(new URL('../src/router/module-routes/misc.ts', import.meta.url), 'utf8')
  assert.match(misc, /path: '\/seal',[\s\S]*?redirect: '\/seal\/board'/)
  assert.match(misc, /path: 'order',\s*name: 'SealOrderSubmit'/)
})
