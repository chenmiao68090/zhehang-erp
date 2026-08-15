import { computed, onMounted, ref, type Ref } from 'vue'
import {
  settingsGovernanceApi,
  unwrapGovernanceData,
  type FieldOptionItem,
  type FieldOptions
} from '@/api/settings-governance'

export interface SelectFieldOption {
  label: string
  value: string
  defaultValue: boolean
  /** 历史值只用于回显，永远不能成为新记录可选项。 */
  disabled?: boolean
  historical?: boolean
}

export type FieldOptionsFallbackReason = 'unconfigured' | 'request-error' | null

function normalizeFallback(fallback: ReadonlyArray<string | SelectFieldOption>): SelectFieldOption[] {
  return fallback.map((item) => typeof item === 'string'
    ? { label: item, value: item, defaultValue: false }
    : { defaultValue: false, ...item })
}

/**
 * 业务下拉统一读取字段治理目录。
 *
 * - configured=true 时，后端返回的列表就是唯一结果；启用项供新选择，停用项只供历史回显；
 * - configured=false（含后端已精确识别的缺表兼容）时，才使用调用页已有常量；
 * - 网络、权限或未知服务错误一律失败收紧，不把旧常量冒充成当前配置；
 * - 这里只消费选项，不在业务页提供修改入口。
 */
export function useFieldOptions(
  dictType: string,
  fallback: ReadonlyArray<string | SelectFieldOption>,
  options: { autoLoad?: boolean } = {}
) {
  const fallbackOptions = normalizeFallback(fallback)
  // 首屏保持为空，等后端明确回答 configured 后才决定目录或兼容兜底。
  // 这样 configured=true + items=[] 在慢网下也不会短暂暴露旧常量。
  const fieldOptions: Ref<SelectFieldOption[]> = ref([])
  const disabledOptions: Ref<SelectFieldOption[]> = ref([])
  const loading = ref(false)
  const resolved = ref(false)
  const configured = ref(false)
  const fallbackReason = ref<FieldOptionsFallbackReason>(null)
  let requestVersion = 0

  async function load() {
    const version = ++requestVersion
    let catalogResolved = false
    loading.value = true
    resolved.value = false
    configured.value = false
    fieldOptions.value = []
    disabledOptions.value = []
    fallbackReason.value = null
    try {
      const response = await settingsGovernanceApi.options(dictType, true)
      const payload = unwrapGovernanceData<FieldOptions>(response)
      if (version !== requestVersion) return
      catalogResolved = true
      configured.value = payload.configured === true
      if (payload.configured === true) {
        // 明确配置为空表示业务决定不提供任何选项，不能偷偷恢复代码常量。
        const mapped = (payload.items || []).map((item: FieldOptionItem) => ({
          label: item.label,
          value: item.value,
          defaultValue: item.defaultValue === true,
          disabled: item.enabled !== true
        }))
        fieldOptions.value = mapped.filter((item) => !item.disabled)
        disabledOptions.value = mapped.filter((item) => item.disabled)
        fallbackReason.value = null
      } else {
        fieldOptions.value = [...fallbackOptions]
        disabledOptions.value = []
        fallbackReason.value = 'unconfigured'
      }
    } catch {
      if (version !== requestVersion) return
      configured.value = false
      fieldOptions.value = []
      disabledOptions.value = []
      fallbackReason.value = 'request-error'
    } finally {
      if (version === requestVersion) {
        loading.value = false
        resolved.value = catalogResolved
      }
    }
  }

  const defaultValue = computed(() => fieldOptions.value.find((item) => item.defaultValue)?.value ?? null)

  /**
   * 把当前记录中已停用/已删除的稳定值追加为禁用项，仅供 Element Plus 正确回显。
   * 未完成目录判定时保持空，避免把“尚未加载”误判为“历史值”。
   */
  function withHistoricalValues(current: string | ReadonlyArray<string> | null | undefined): SelectFieldOption[] {
    if (!resolved.value) return []
    const values = (Array.isArray(current) ? current : [current])
      .map((value) => String(value ?? '').trim())
      .filter(Boolean)
    const known = new Set(fieldOptions.value.map((item) => item.value))
    const disabledByValue = new Map(disabledOptions.value.map((item) => [item.value, item]))
    const historical = [...new Set(values)]
      .filter((value) => !known.has(value))
      .map((value) => {
        const disabled = disabledByValue.get(value)
        return disabled
          ? { ...disabled, disabled: true, historical: true }
          : {
              label: `${value}（历史值，当前不可选）`,
              value,
              defaultValue: false,
              disabled: true,
              historical: true
            }
      })
    return [...fieldOptions.value, ...historical]
  }

  function isSelectable(value: string | null | undefined): boolean {
    if (!value) return true
    return resolved.value && fieldOptions.value.some((item) => item.value === value && !item.disabled)
  }

  if (options.autoLoad !== false) onMounted(load)

  return {
    options: fieldOptions,
    disabledOptions,
    loading,
    resolved,
    configured,
    defaultValue,
    fallbackReason,
    usingFallback: computed(() => fallbackReason.value === 'unconfigured'),
    withHistoricalValues,
    isSelectable,
    reload: load
  }
}
