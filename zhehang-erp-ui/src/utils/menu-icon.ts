/**
 * 菜单图标自动匹配:子类目没显式 meta.icon 时,按标题关键词自动配一个 Element Plus 图标。
 * 以后新增子类目无需手动加图标——有 meta.icon 用它,没有就按标题自动匹配,再兜底 Menu。
 * 颜色由 Sidebar 的 tileColor(按路径)自动分配,所以新菜单图标+颜色都是自动的。
 */
const KEYWORD_ICONS: Array<[RegExp, string]> = [
  [/首页|工作台|个人中心|主页/, 'HomeFilled'],
  [/客户|线索|crm|公海|私域|资源库/i, 'User'],
  [/合同/, 'Document'],
  [/提单|订单|开单|单据/, 'Tickets'],
  [/凭证|记账|总账|账簿|日记账/, 'Notebook'],
  [/发票/, 'Document'],
  [/税/, 'Money'],
  [/薪|工资|提成|奖金/, 'Coin'],
  [/财务|资金|核对|支出|报销|备用金|成本/, 'Wallet'],
  [/报表|统计|分析|看板|大盘|投产|投流|roi|业绩/i, 'TrendCharts'],
  [/数据/, 'DataLine'],
  [/刻章|印章|盖章|用印|^章/, 'Stamp'],
  [/库存|采购|补充|入库|资源池/, 'Box'],
  [/资产|用品|物资|固定资产/, 'Goods'],
  [/工商|执照|注册|代办/, 'OfficeBuilding'],
  [/交接/, 'Switch'],
  [/任务|交付|派单/, 'List'],
  [/满意|回访|评价/, 'Star'],
  [/同行|渠道/, 'Share'],
  [/地址|区域|外区|地图/, 'MapLocation'],
  [/供应商|供应|厂商/, 'Shop'],
  [/续费|续约/, 'RefreshRight'],
  [/绩效|考核|目标|kpi/i, 'Aim'],
  [/招聘|面试|入职|花名册/, 'UserFilled'],
  [/人力|人事|员工|档案|通讯录/, 'Avatar'],
  [/部门|组织|架构/, 'OfficeBuilding'],
  [/岗位|职位/, 'Postcard'],
  [/考勤|假勤|假期|请假|打卡/, 'Calendar'],
  [/到期|提醒|日历|预警/, 'AlarmClock'],
  [/知识|文库|文档|文章|资料|手册/, 'Collection'],
  [/培训|课程|学习|考试|测评/, 'Reading'],
  [/问答|智能|ai|机器人/i, 'MagicStick'],
  [/审批|流程|审核/, 'Stamp'],
  [/角色|权限|授权/, 'Lock'],
  [/菜单/, 'Menu'],
  [/日志|记录/, 'Document'],
  [/规则|配置|设置|参数/, 'SetUp'],
  [/系统|平台|后台/, 'Setting'],
  [/监控|实时/, 'Monitor'],
  [/外呼|呼叫|电话|通话|坐席|号码/, 'Phone'],
  [/消息|通知|公告/, 'Bell'],
  [/运营|服务/, 'TrendCharts'],
  [/文件|附件|资料库/, 'Folder']
]

/** 返回该菜单项应显示的图标名:优先显式 icon,否则按标题关键词匹配,再兜底 Menu。 */
export function resolveMenuIcon(title?: string, explicit?: string): string {
  if (explicit) return explicit
  const t = title || ''
  for (const [re, icon] of KEYWORD_ICONS) {
    if (re.test(t)) return icon
  }
  return 'Menu'
}
