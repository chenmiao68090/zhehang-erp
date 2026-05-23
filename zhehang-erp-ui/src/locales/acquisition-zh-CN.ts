export default {
  acquisition: {
    title: '智能获客',
    segment: '客群总览',
    enterprise: '企业列表',
    enterpriseDetail: '企业详情',
    // 客群相关
    segmentGroups: {
      basic: '基础业务客群',
      competitor: '同行切户',
      ecommerce: '电商客群',
      newEnterprise: '新企商机'
    },
    segments: {
      F01: '代理记账新开',
      F02: '经营异常解除',
      F03: '税务异常解除',
      F04: '年报客群',
      F05: '服务质量问题',
      F06: '同期成立企业',
      F07: '同行服务客户',
      F08: '电商财税合规',
      F09: 'T+1新企商机',
      F10: 'T+7新企商机'
    },
    // 统计Tab
    tabs: {
      all: '全部',
      taxAbnormal: '税务非正常户',
      taxArrears: '欠税公告',
      majorViolation: '重大税收违法',
      taxPenalty: '税务行政处罚',
      operationAbnormal: '经营异常'
    },
    // 筛选维度
    filters: {
      registerRegion: '注册地区',
      establishmentDate: '成立时间',
      registeredCapital: '注册资本',
      enterpriseType: '企业类型',
      industry: '所属行业',
      staffCount: '人员规模',
      annualRevenue: '年营业额',
      enterpriseStatus: '经营状态',
      taxQualification: '税务资质',
      abnormalStatus: '经营异常名录',
      taxAbnormalType: '税务异常类型',
      hasContact: '是否有联系方式',
      more: '更多筛选',
      clearAll: '清空全部',
      saveTemplate: '保存筛选方案',
      selectedCount: '已选 {n} 个条件'
    },
    // 排序
    sort: {
      comprehensive: '综合排序',
      smart: '智能排序',
      establishmentDesc: '最新成立',
      establishmentAsc: '最早成立',
      abnormalDateDesc: '异常时间最近',
      capitalDesc: '注册资本最高',
      revenueDesc: '营业额最高',
      contactDesc: '联系方式最多'
    },
    // 操作
    actions: {
      unlock: '立即解锁',
      viewDetail: '查看详情',
      addToCrm: '添加到CRM',
      addAsLead: '添加为线索',
      addAsCustomer: '添加为客户',
      batchUnlock: '批量解锁',
      batchExport: '导出',
      batchAssign: '分配给',
      batchTag: '添加标签',
      notInterested: '不感兴趣',
      addRemark: '添加备注'
    },
    // 企业卡片
    card: {
      contactCount: '联系方式',
      pendingAbnormal: '当前待处理异常数',
      establishmentDate: '成立',
      annualRevenue: '年营业额',
      registeredCapital: '注册资本',
      industry: '所属行业',
      address: '注册地址',
      abnormalInfo: '异常信息',
      abnormalType: '异常类型',
      inclusionReason: '列入原因',
      inclusionDate: '列入日期',
      decisionOrg: '决定机关'
    },
    // 详情页
    detail: {
      backToList: '返回列表',
      prevEnterprise: '上一企业',
      nextEnterprise: '下一企业',
      aiScore: 'AI企业评分',
      highPotential: '高意向',
      mediumPotential: '中意向',
      lowPotential: '低意向',
      tabs: {
        business: '工商信息',
        tax: '税务信息',
        risk: '经营风险',
        ip: '知识产权',
        contact: '联系方式',
        related: '关联企业'
      },
      basicInfo: {
        status: '经营状态',
        establishDate: '成立日期',
        capital: '注册资本',
        paidCapital: '实缴资本',
        staffCount: '人员规模',
        revenue: '年营业额',
        industry: '所属行业',
        address: '注册地址',
        creditCode: '统一社会信用代码',
        legalPerson: '法定代表人',
        businessScope: '经营范围',
        businessTerm: '营业期限'
      }
    },
    // 空状态
    empty: {
      noData: '暂无匹配企业',
      noDataDesc: '当前筛选条件下没有找到匹配的企业，请尝试调整筛选条件',
      noSegmentData: '该客群暂无企业',
      loadError: '数据加载失败',
      loadErrorDesc: '请检查网络连接后重试',
      retry: '重新加载',
      clearFilter: '清空筛选条件'
    },
    // 统计
    stats: {
      totalEnterprise: '总企业数',
      todayNew: '今日新增',
      unlocked: '已解锁',
      converted: '已转化'
    },
    // 菜单分类
    menu: {
      basicBusiness: '基础业务',
      peerSwitch: '同行切户',
      ecommerce: '电商客群',
      newBusiness: '新企商机',
      taxAbnormal: '税务异常解除',
      operationAbnormal: '经营异常解除',
      bookkeeping: '代理记账新开',
      annualReport: '年报客群',
      peerQuality: '服务质量问题',
      peerNew: '同期成立企业',
      peerCustomer: '同行服务客户',
      ecommerceCompliance: '电商财税合规',
      newBizT1: 'T+1 新企商机',
      newBizT7: 'T+7 新企商机'
    },
    // 客群Banner描述
    banner: {
      taxAbnormal: '税务异常解除 当前认定税务异常的企业，需解除异常。若不处理，企业将无法开票、报税退税甚至被注销税务登记证，日常经营受到影响。',
      operationAbnormal: '经营异常解除 当前被列入经营异常名录的企业，需解除异常。若不处理，将影响企业信用评分、贷款融资和招投标等。',
      bookkeeping: '代理记账新开 近期新注册成立的企业，有代理记账、税务申报等基础财税服务需求。',
      annualReport: '年报客群 需要进行年度报告公示的企业，未按时年报将被列入经营异常名录。',
      peerQuality: '服务质量问题 当前由同行服务、但存在服务质量问题的企业，有更换服务商的意向。',
      peerNew: '同期成立企业 与您现有客户同期成立的企业，具有相似的服务需求和发展阶段。',
      peerCustomer: '同行服务客户 由竞争对手服务的企业客户，了解其服务情况有助于精准营销。',
      ecommerceCompliance: '电商财税合规 从事电商业务的企业，在税务合规、发票管理等方面有特殊需求。',
      newBizT1: 'T+1 新企商机 昨日新注册成立的企业，第一时间触达可获取最高转化率。',
      newBizT7: 'T+7 新企商机 近7天内新注册成立的企业，仍处于选择服务商的黄金窗口期。'
    },
    // 筛选标签
    filterLabels: {
      occurDate: '发生日期',
      companyType: '公司类型',
      taxQualification: '税务资质',
      establishTime: '成立时间',
      all: '全部',
      recent1Month: '近1个月',
      recent3Months: '近3个月',
      recent6Months: '近半年',
      recent1Year: '近1年',
      custom: '自定义',
      individual: '个体户',
      enterprise: '企业',
      generalTaxpayer: '一般纳税人',
      smallScaleTaxpayer: '小规模纳税人',
      suspectedSmallScale: '疑似小规模纳税人',
      other: '其他',
      recent3Years: '近3年',
      recent5Years: '近5年',
      recent10Years: '近10年'
    },
    // 列表操作
    listActions: {
      foundEnterprise: '找到企业',
      unit: '家',
      selectCurrentPage: '勾选当前页',
      selectAll: '勾选全部',
      enterprises: '家企业',
      addToCrm: '添加到CRM',
      unlock: '解锁',
      moreActions: '更多操作',
      comprehensiveSort: '综合排序',
      intelligentSort: '智能排序',
      allEnterprise: '全部企业'
    },
    // 卡片标签
    cardLabels: {
      hot: 'HOT',
      contactMethods: '联系方式',
      establishDate: '成立时间',
      annualRevenue: '年营业额',
      registeredCapital: '注册资本',
      taxQualification: '税务资质',
      industry: '所属行业',
      address: '注册地址',
      abnormalReason: '列入原因',
      abnormalDate: '列入日期',
      decisionAuthority: '决定机关',
      occurDate: '发生日期',
      unlockNow: '立即解锁',
      pendingAbnormal: '当前待处理异常',
      operating: '营业',
      cancelled: '注销',
      revoked: '吊销',
      survived: '存续'
    }
  }
}
