import type { RouteRecordNormalized } from 'vue-router'

type RouteMatchLike = Pick<RouteRecordNormalized, 'meta'>

const publicRoutePrefixes = ['/onboarding/form/', '/onboarding/public/']

/**
 * 公共页面不依赖登录态。即使浏览器里残留了过期 JWT，也应直接进入公共页面，
 * 由页面自己的安全票据完成后续接口校验。
 */
export function isPublicRoute(path: string, matched: readonly RouteMatchLike[]): boolean {
  return path === '/404'
    || matched.some((record) => record.meta?.public === true)
    || publicRoutePrefixes.some((prefix) => path.startsWith(prefix))
}
