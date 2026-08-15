import { feigeOrderApi } from '@/api/feige-order-contract'
import { feigeDemoApi, isFeigeLocalDemo } from './demo-store'

export const feigeOrderData = (isFeigeLocalDemo() ? feigeDemoApi : feigeOrderApi) as unknown as typeof feigeOrderApi
export const feigeLocalDemo = isFeigeLocalDemo()
