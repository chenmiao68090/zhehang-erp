export const LOGIN_PAGE_UPDATED_MESSAGE = '当前页面已更新，请刷新页面后重新登录'

export interface AuthenticatedAccessResult {
  action: string
  accessToken?: string
  token?: string
}

/**
 * V214 compatibility: V210+ 登录只在 JSON 中返回短期 access token，refresh token 由 HttpOnly
 * Cookie 承载。若旧页面/新接口切换期间 AUTHENTICATED 响应缺少 access，最多
 * 使用 Cookie 恢复一次；失败时要求刷新页面，避免循环刷新或恢复旧本地凭证。
 */
export async function resolveAuthenticatedAccessToken(
  result: AuthenticatedAccessResult,
  restoreFromHttpOnlyCookie: () => Promise<string | null>
): Promise<string> {
  const directAccess = result.accessToken || result.token
  if (directAccess) return directAccess

  if (result.action === 'AUTHENTICATED') {
    try {
      const restoredAccess = await restoreFromHttpOnlyCookie()
      if (restoredAccess) return restoredAccess
    } catch {
      // 统一转换为可操作的版本漂移提示，不暴露 Cookie 或刷新失败细节。
    }
  }

  throw new Error(LOGIN_PAGE_UPDATED_MESSAGE)
}
