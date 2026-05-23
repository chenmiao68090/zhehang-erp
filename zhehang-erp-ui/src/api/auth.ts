import { post, get } from './request'

export interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
}

export function loginApi(data: LoginParams) {
  return post('/auth/login', data)
}

export function getUserInfoApi() {
  return get('/auth/info')
}

export function logoutApi() {
  return post('/auth/logout')
}

export function getCaptchaApi() {
  return get('/auth/captcha')
}

export function refreshTokenApi() {
  return post('/auth/refresh')
}
