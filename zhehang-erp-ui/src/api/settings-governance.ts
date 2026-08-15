import { get } from './request'

export type GovernanceRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RuleIntegrationState = 'CONNECTED' | 'PARTIAL' | 'PLANNED' | 'READ_ONLY'
export type FieldIntegrationState = 'CONNECTED' | 'PENDING' | 'READ_ONLY' | 'DOMAIN_MANAGED'

export interface RuleDefinition {
  code: string
  name: string
  domainCode: string
  domainName: string
  type: string
  sourceKind: string
  sourceName: string
  sourceTable?: string | null
  manageRoute?: string | null
  riskLevel: GovernanceRiskLevel
  changeMode: string
  integrationState: RuleIntegrationState
  supportsSimulation: boolean
  supportsRollback: boolean
  summary: string
  impactScope: string
  legacyWarning?: string | null
  sort?: number | null
}

export interface FieldDefinition {
  key: string
  name: string
  moduleCode: string
  moduleName: string
  pageNames: string[]
  pageRoutes: string[]
  storageField: string
  controlType: string
  sourceKind: string
  sourceName: string
  dictType?: string | null
  valueType: string
  riskLevel: GovernanceRiskLevel
  integrationState: FieldIntegrationState
  editPolicy: string
  historyPolicy: string
  required: boolean
  optionCount?: number | null
  usageCount?: number | null
  manageRoute?: string | null
  description: string
  warning?: string | null
  sort?: number | null
}

export interface FieldOptionItem {
  label: string
  value: string
  sort?: number | null
  defaultValue: boolean
  /** false 的项仅用于历史值标签回显，不得成为新选择。 */
  enabled: boolean
}

export interface FieldOptions {
  configured: boolean
  dictType: string
  dictName?: string | null
  editPolicy: string
  historyPolicy: string
  /** 后端返回启用与停用项；业务选择器必须再按 enabled 收紧。 */
  items: FieldOptionItem[]
}

interface ApiEnvelope<T> {
  data: T
}

export function unwrapGovernanceData<T>(response: ApiEnvelope<T> | T): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiEnvelope<T>).data
  }
  return response as T
}

export const settingsGovernanceApi = {
  rules: () => get<ApiEnvelope<RuleDefinition[]>>('/system/settings-governance/rules'),
  fields: () => get<ApiEnvelope<FieldDefinition[]>>('/system/settings-governance/fields'),
  options: (dictType: string, silentError = false) =>
    get<ApiEnvelope<FieldOptions>>(
      `/system/settings-governance/options/${encodeURIComponent(dictType)}`,
      undefined,
      { silentError }
    )
}
