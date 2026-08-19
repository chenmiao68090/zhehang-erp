import { createRouter, createWebHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { constantRoutes } from './routes'
import { setupRouterGuard } from './guard'
import { registerMemoRoute } from './memo-route'

registerMemoRoute(constantRoutes)

/** 一次整页重载即可自愈,用会话标记防止重载循环。 */
const CHUNK_RELOAD_FLAG = 'zhehang:chunk-reload'

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(CHUNK_RELOAD_FLAG) === '1'
  } catch {
    return true
  }
}

function writeFlag(value: boolean) {
  try {
    if (value) sessionStorage.setItem(CHUNK_RELOAD_FLAG, '1')
    else sessionStorage.removeItem(CHUNK_RELOAD_FLAG)
  } catch {
    /* 隐私模式下 sessionStorage 不可用,放弃自愈,不影响正常导航 */
  }
}

/**
 * 路由懒加载 chunk 拉取失败时(最常见于发布后仍开着旧标签页,
 * 旧 index.html 引用的 hash 文件已被新产物替换),vue-router 只会静默 reject:
 * 地址栏不动、主内容区留在原页面,用户点顶栏/左侧菜单像完全失灵,只能自己刷新。
 * 这里对这类错误自动整页跳到目标地址,拿到新产物后恢复正常。
 */
function setupChunkFailureRecovery(router: Router) {
  router.onError((error, to) => {
    const message = String((error as Error)?.message || '')
    const isChunkLoadFailure = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(message)
    if (!isChunkLoadFailure || readFlag()) return
    writeFlag(true)
    window.location.assign(to.fullPath)
  })
  // 任意一次导航成功即说明产物已对齐,允许下次再自愈。
  router.afterEach(() => writeFlag(false))
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
})

setupRouterGuard(router)
setupChunkFailureRecovery(router)

export default router
