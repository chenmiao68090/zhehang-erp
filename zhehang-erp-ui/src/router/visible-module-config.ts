export interface VisibleModuleSubItem {
  path: string
}

export interface VisibleModuleConfigGroup {
  name: string
}

export type VisibleModuleSubMap = Record<string, VisibleModuleSubItem[]>

/**
 * 将角色记录中的大类名、旧大类名或精确子路由还原为角色设置页的勾选集合。
 * null/空串沿用既有语义：不限制，即全选。
 */
export function parseVisibleModuleSubs(
  value: unknown,
  allSubPaths: readonly string[],
  configurableGroups: readonly VisibleModuleConfigGroup[],
  groupSubs: VisibleModuleSubMap,
  legacyGroupSubs: VisibleModuleSubMap
): Set<string> {
  const raw = String(value || '').trim()
  const checked = new Set<string>()
  if (!raw) {
    allSubPaths.forEach((path) => checked.add(path))
    return checked
  }

  const itemSet = new Set(raw.split(',').map((item) => item.trim()).filter(Boolean))
  for (const [legacyGroup, subs] of Object.entries(legacyGroupSubs)) {
    if (itemSet.has(legacyGroup)) subs.forEach((sub) => checked.add(sub.path))
  }
  for (const group of configurableGroups) {
    const subs = groupSubs[group.name] || []
    if (itemSet.has(group.name)) {
      subs.forEach((sub) => checked.add(sub.path))
    } else {
      subs.forEach((sub) => {
        if (itemSet.has(sub.path)) checked.add(sub.path)
      })
    }
  }
  return checked
}

/**
 * 将角色设置页的勾选集合归一化为后端 visible_modules：
 * 全部大类全开保存 null；单个大类全开保存当前大类名；部分开启保存精确子路由。
 */
export function serializeVisibleModuleSubs(
  checked: ReadonlySet<string>,
  allSubPaths: readonly string[],
  configurableGroups: readonly VisibleModuleConfigGroup[],
  groupSubs: VisibleModuleSubMap
): string | null {
  if (checked.size === allSubPaths.length && allSubPaths.every((path) => checked.has(path))) return null

  const parts: string[] = []
  for (const group of configurableGroups) {
    const subs = groupSubs[group.name] || []
    const selected = subs.filter((sub) => checked.has(sub.path))
    if (subs.length > 0 && selected.length === subs.length) {
      parts.push(group.name)
    } else {
      selected.forEach((sub) => parts.push(sub.path))
    }
  }
  return parts.join(',')
}
