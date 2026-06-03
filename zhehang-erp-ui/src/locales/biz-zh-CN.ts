/**
 * 业务模块中文国际化键值
 * 涵盖：提单系统 / 财务核对 / 合同管理 / 任务中心 / 渠道管理
 */
export default {
  // 提单系统
  order: {
    title: '提单系统',
    orderNo: '订单编号',
    status: {
      draft: '草稿',
      pending_approval: '待主管审批',
      pending_finance: '待财务确认',
      rejected: '已驳回',
      completed: '已完成',
      cancelled: '已取消'
    },
    serviceType: {
      bookkeeping: '代理记账',
      registration: '工商注册',
      tax_planning: '税务筹划',
      qualification: '资质代办',
      audit: '审计报告',
      cancellation: '注销公司',
      other: '其他'
    },
    servicePeriod: {
      '1month': '1个月',
      '3month': '3个月',
      '6month': '6个月',
      '1year': '1年',
      '2year': '2年',
      '3year': '3年',
      one_time: '一次性'
    },
    paymentMethod: {
      lump_sum: '一次性付清',
      monthly: '月付',
      quarterly: '季付',
      semi_annual: '半年付',
      annual: '年付',
      installment: '分期'
    },
    confirmMethod: {
      wechat: '微信确认',
      phone: '电话确认',
      meeting: '面谈确认',
      email: '邮件确认'
    }
  },
  // 财务核对
  receipt: {
    title: '财务核对',
    status: {
      pending: '待确认',
      confirmed: '已确认',
      partial: '部分收款',
      refunding: '退款中',
      bad_debt: '坏账'
    },
    paymentMethod: {
      bank_transfer: '对公转账',
      alipay: '支付宝',
      wechat: '微信',
      cash: '现金',
      pos: 'POS刷卡',
      other: '其他'
    },
    invoiceType: {
      special_vat: '增值税专用发票',
      general_vat: '增值税普通发票',
      electronic: '电子发票'
    },
    invoiceStatus: {
      pending: '待开',
      issued: '已开',
      sent: '已寄出',
      received: '客户已收',
      cancelled: '已作废'
    }
  },
  // 合同管理
  contract: {
    title: '合同管理',
    status: {
      draft: '草稿',
      pending_sign: '待签署',
      effective: '已生效',
      executing: '履行中',
      expiring: '即将到期',
      expired: '已到期',
      renewed: '已续签',
      terminated: '已终止'
    },
    signMethod: {
      esign: 'e签宝电子签署',
      offline: '线下签署',
      mail: '邮寄签署'
    },
    renewalIntention: {
      not_contacted: '未联系',
      interested: '有意向',
      not_interested: '无意向',
      pending: '待定'
    }
  },
  // 任务中心
  task: {
    title: '任务中心',
    type: {
      A: '一次性业务',
      B: '周期性业务',
      C: '项目部业务',
      D: '老板特殊安排'
    },
    status: {
      unassigned: '待分配',
      assigned: '已分配',
      in_progress: '执行中',
      pending_review: '待验收',
      completed: '已完成',
      overdue: '已逾期',
      paused: '已暂停'
    },
    priority: {
      urgent: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    },
    reviewResult: {
      pass: '通过',
      fail: '不通过',
      rework: '需返工'
    },
    handover: {
      title: '客户交接',
      status: {
        pending: '待交接',
        in_progress: '交接中',
        completed: '已完成',
        overdue: '已逾期'
      }
    },
    commission: {
      title: '提成结算',
      status: {
        pending_sales: '待销售确认',
        pending_manager: '待主管审核',
        pending_finance: '待财务确认',
        pending_boss: '待老板审批',
        paid: '已发放',
        rejected: '已驳回'
      }
    },
    satisfaction: {
      title: '满意度回访',
      type: {
        first_service: '首次服务',
        '3month': '3个月',
        '6month': '6个月',
        '12month': '12个月',
        complaint: '投诉后',
        manual: '手动发起'
      }
    }
  },
  // 渠道管理
  channel: {
    title: '渠道管理',
    supplier: {
      title: '地址供应商',
      status: {
        active: '合作中',
        paused: '已暂停',
        terminated: '已终止',
        potential: '意向合作'
      },
      level: {
        A: 'A级(优质)',
        B: 'B级(一般)',
        C: 'C级(观察)'
      }
    },
    address: {
      title: '挂靠地址资源',
      status: {
        available: '可用',
        reserved: '已预留',
        sold: '已售出',
        expired: '已到期',
        abnormal: '异常'
      }
    },
    procurement: {
      title: '资源补充单',
      status: {
        draft: '草稿',
        pending_approval: '待审批',
        approved: '已审批',
        paid: '已付款',
        stocked: '已上架',
        cancelled: '已取消'
      }
    },
    cost: {
      title: '网销投产比',
      channel: {
        baidu: '百度推广',
        douyin: '抖音',
        xiaohongshu: '小红书',
        '58': '58同城',
        seo: '官网SEO',
        other: '其他'
      }
    },
    region: {
      shangcheng: '上城区',
      gongshu: '拱墅区',
      xihu: '西湖区',
      binjiang: '滨江区',
      xiaoshan: '萧山区',
      yuhang: '余杭区',
      linping: '临平区',
      qiantang: '钱塘区',
      fuyang: '富阳区',
      linan: '临安区',
      tonglu: '桐庐县',
      chunan: '淳安县',
      jiande: '建德市'
    }
  }
}
