import { post, get } from './request'

export interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
}

export type AuthAction =
  | 'AUTHENTICATED'
  | 'REQUIRE_PASSWORD_CHANGE'
  | 'REQUIRE_MFA_ENROLL'
  | 'REQUIRE_MFA'
  | 'LOGIN_AGAIN'

export interface AuthStepResult {
  action: AuthAction
  challengeId?: string
  username?: string
  expiresIn?: number
  accessToken?: string
  refreshToken?: string
  token?: string
  message?: string
}

export interface CaptchaChallenge {
  uuid: string
  image: string
}

export interface MfaEnrollment {
  secret: string
  otpauthUri: string
}

export function loginApi(data: LoginParams) {
  return post<{ code: number; message: string; data: AuthStepResult }>('/auth/login', data, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function getUserInfoApi() {
  return get('/auth/info')
}

export function logoutApi(refreshToken?: string) {
  return post('/auth/logout', refreshToken ? { refreshToken } : {})
}

export function getCaptchaApi() {
  return get<{ code: number; message: string; data: CaptchaChallenge }>('/auth/captcha', undefined, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function changeInitialPasswordApi(data: { challengeId: string; newPassword: string }) {
  return post<{ code: number; message: string; data: AuthStepResult }>('/auth/first-password', data, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function startMfaEnrollmentApi(challengeId: string) {
  return post<{ code: number; message: string; data: MfaEnrollment }>('/auth/mfa/enroll', { challengeId }, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function confirmMfaEnrollmentApi(data: { challengeId: string; code: string }) {
  return post<{ code: number; message: string; data: AuthStepResult }>('/auth/mfa/confirm', data, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function verifyMfaApi(data: { challengeId: string; code: string }) {
  return post<{ code: number; message: string; data: AuthStepResult }>('/auth/mfa/verify', data, {
    silentError: true,
    skipAuthRedirect: true
  })
}

export function revokeAllSessionsApi() {
  return post('/auth/sessions/revoke-all')
}

export function refreshTokenApi(refreshToken?: string) {
  return post('/auth/refresh', refreshToken ? { refreshToken } : {})
}
