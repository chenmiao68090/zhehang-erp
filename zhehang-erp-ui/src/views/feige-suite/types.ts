export type FeigeSuiteKind = 'table' | 'exam' | 'dashboard' | 'analysis' | 'handover' | 'salary' | 'cards' | 'config'
export type FeigeSuiteFieldType = 'text' | 'textarea' | 'number' | 'money' | 'select' | 'date' | 'datetime' | 'month' | 'switch' | 'rate'

export interface FeigeSuiteOption {
  label: string
  value: string | number | boolean
}

export interface FeigeSuiteFieldConfig {
  key: string
  label: string
  type?: FeigeSuiteFieldType
  required?: boolean
  placeholder?: string
  options?: FeigeSuiteOption[]
  unit?: string
  span?: 1 | 2
  min?: number
  max?: number
}

export interface FeigeSuiteColumnConfig {
  key: string
  label: string
  minWidth?: number
  width?: number
  type?: 'text' | 'money' | 'date' | 'datetime' | 'status' | 'progress' | 'score' | 'boolean'
  tooltip?: boolean
}

export interface FeigeSuiteActionConfig {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  requiresRemark?: boolean
}

export interface FeigeSuitePageConfig {
  code: string
  group: FeigeSuiteGroupCode
  title: string
  description: string
  legacyPath: string
  kind: FeigeSuiteKind
  icon: string
  primaryLabel: string
  keywordPlaceholder?: string
  filters: FeigeSuiteFieldConfig[]
  fields: FeigeSuiteFieldConfig[]
  columns: FeigeSuiteColumnConfig[]
  actions: FeigeSuiteActionConfig[]
  tabs?: FeigeSuiteOption[]
  statLabels?: string[]
  notes?: string[]
}

export type FeigeSuiteGroupCode = 'learning' | 'consultant' | 'management' | 'finance' | 'knowledge' | 'hr' | 'salary' | 'reimbursement' | 'notice'

export interface FeigeSuiteGroupConfig {
  code: FeigeSuiteGroupCode
  title: string
  basePath: string
  icon: string
  color: string
  description: string
}
