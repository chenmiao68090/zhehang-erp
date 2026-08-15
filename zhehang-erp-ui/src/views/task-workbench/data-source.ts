import { feigeTaskApi } from '@/api/feige-task'
import { feigeTaskDemoApi, isFeigeTaskLocalDemo } from './demo-data'

function currentDataSource() {
  return (isFeigeTaskLocalDemo() ? feigeTaskDemoApi : feigeTaskApi) as unknown as typeof feigeTaskApi
}

export const feigeTaskData = new Proxy({} as typeof feigeTaskApi, {
  get(_target, property) {
    const source = currentDataSource() as any
    const value = source[property]
    return typeof value === 'function' ? value.bind(source) : value
  }
})

export const feigeTaskLocalDemo = isFeigeTaskLocalDemo
