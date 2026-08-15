import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const topNav = readFileSync(new URL('../src/components/layout/TopNav.vue', import.meta.url), 'utf8')
const sidebar = readFileSync(new URL('../src/components/layout/Sidebar.vue', import.meta.url), 'utf8')
const accountDock = readFileSync(new URL('../src/components/layout/SidebarAccount.vue', import.meta.url), 'utf8')
const messageCenter = readFileSync(new URL('../src/components/MessageCenter.vue', import.meta.url), 'utf8')
const loginCspBoundary = readFileSync(new URL('./v216-login-csp-boundary.test.ts', import.meta.url), 'utf8')

test('顶部导航不再承载消息和账户菜单', () => {
  assert.doesNotMatch(topNav, /MessageCenter/)
  assert.doesNotMatch(topNav, /tn-right/)
  assert.doesNotMatch(topNav, /修改密码弹窗/)
})

test('账户区固定在侧栏菜单之后并保持折叠布局', () => {
  assert.match(sidebar, /<el-scrollbar class="sidebar-menu-scroll">[\s\S]*?<\/el-scrollbar>\s*<SidebarAccount\s*\/>/)
  assert.match(sidebar, /\.sidebar-menu-scroll\s*\{[\s\S]*?flex:\s*1;[\s\S]*?min-height:\s*0;/)
  assert.match(accountDock, /class="sidebar-account"/)
  assert.match(accountDock, /appStore\.sidebarCollapsed/)
  assert.match(accountDock, /\.sidebar-account\.collapsed/)
})

test('消息、个人中心、改密、退出和员工视角能力完整保留', () => {
  assert.match(accountDock, /<MessageCenter v-if="!impersonationStore\.active" placement="sidebar-bottom"/)
  assert.match(accountDock, /切换员工视角/)
  assert.match(accountDock, /个人中心/)
  assert.match(accountDock, /修改密码/)
  assert.match(accountDock, /退出登录/)
  assert.match(accountDock, /退出员工视角/)
  assert.match(accountDock, /IMPERSONATION_ACTOR_USER_ID/)
  assert.match(accountDock, /markLogoutTransition/)
  assert.match(loginCspBoundary, /src\/components\/layout\/SidebarAccount\.vue/)
})

test('左下角消息面板向上展开且窄屏不越界', () => {
  assert.match(messageCenter, /placement\?: 'top-right' \| 'sidebar-bottom'/)
  assert.match(messageCenter, /\.im-entry\.sidebar-bottom \.im-popover \{ top: auto; right: auto; bottom: 46px; left: 0;/)
  assert.match(messageCenter, /\.im-entry\.sidebar-bottom \.im-popover \{ top: auto; right: 8px; bottom: 72px; left: 8px; width: auto;/)
})
