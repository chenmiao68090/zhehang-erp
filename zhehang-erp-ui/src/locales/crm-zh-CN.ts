// CRM 模块中文国际化
export default {
  crm: {
    // 线索管理
    lead: {
      title: '线索管理',
      name: '公司名称',
      company: '联系人',
      phone: '联系电话',
      email: '公司地址',
      source: '来源',
      status: '跟进状态',
      owner: '负责人',
      remark: '备注',
      createTime: '创建时间',
      convert: '转化',
      assign: '分配',
      convertConfirm: '确定将此线索转化为客户？',
      convertSuccess: '线索转化成功',
      sourceOptions: {
        tianyancha: '天眼查平台',
        referral: '老客户转介绍',
        meituan: '运营-美团',
        douyin: '运营-抖音',
        offline: '线下来客'
      },
      statusOptions: {
        newCustomer: '0新建客户',
        initialContact: 'A初步接洽',
        requirementConfirm: 'B需求确认',
        proposal: 'C方案报价',
        negotiation: 'D谈判审核',
        closed: 'E成交'
      },
      // 公海池
      pool: '线索池',
      myLeads: '我的线索',
      allLeads: '全部线索',
      claim: '领取',
      claimSuccess: '领取成功',
      returnPool: '退回公海',
      returnReason: '退回原因',
      returnSuccess: '退回成功',
      distribute: '分配',
      distributeTo: '分配给',
      distributeSuccess: '分配成功',
      moreActions: '更多',
      importBtn: '导入',
      exportBtn: '导出',
      poolRules: '设置公海规则',
      duplicateCheck: '查重工具',
      lastFollowTime: '最近跟进',
      ownerName: '负责人',
      // 批量操作
      batchClaim: '批量领取',
      batchReturn: '批量退回',
      batchDistribute: '批量分配',
      batchDelete: '批量删除',
      selectAtLeast: '请至少选择一条记录',
      // 公海规则
      rules: {
        title: '公海规则设置',
        assignRules: '分配规则',
        reclaimRules: '自动回收规则',
        ruleName: '规则名称',
        trigger: '触发条件',
        triggerOptions: {
          newLead: '新线索进入公海',
          manual: '手动触发'
        },
        assignMethod: '分配方式',
        methodOptions: {
          roundRobin: '轮流分配',
          byCapacity: '按容量分配',
          specified: '指定人员'
        },
        assignTarget: '分配对象',
        maxHold: '最大保有量',
        priority: '优先级',
        enabled: '启用',
        disabled: '禁用',
        reclaimCondition: '回收条件',
        conditionOptions: {
          noFollow: '未跟进自动回收',
          noConvert: '未转化自动回收',
          overCapacity: '超保有量回收'
        },
        days: '天',
        scope: '适用范围',
        scopeOptions: {
          all: '全部人员',
          dept: '指定部门',
          person: '指定人员'
        },
        addRule: '添加规则',
        deleteRule: '删除规则',
        saveSuccess: '规则保存成功',
        noRules: '暂无规则，点击下方按钮添加'
      },
      // 导入
      importDialog: {
        title: '导入线索',
        downloadTpl: '下载模板',
        selectFile: '选择文件',
        preview: '数据预览',
        confirm: '确认导入',
        success: '导入成功',
        uploadTip: '支持 .csv、.xlsx 格式文件',
        mapping: '字段映射'
      },
      exportSuccess: '导出成功',
      // 查重
      duplicate: {
        title: '查重工具',
        searchBy: '查重字段',
        phone: '手机号',
        name: '线索名称',
        search: '开始查重',
        result: '查重结果',
        found: '发现重复记录',
        noFound: '未发现重复记录',
        duplicateCount: '重复数量'
      }

    },
    // 客户管理
    customer: {
      title: '客户管理',
      name: '客户名称',
      shortName: '客户简称',
      industry: '所属行业',
      scale: '企业规模',
      source: '客户来源',
      level: '客户等级',
      taxpayerType: '纳税人类型',
      creditCode: '统一社会信用代码',
      address: '地址',
      website: '网址',
      status: '状态',
      owner: '负责人',
      servicePackage: '服务套餐',
      billingCycle: '账期',
      remark: '备注',
      createTime: '创建时间',
      toPool: '退回公海',
      toPoolConfirm: '确定将此客户退回公海池？',
      toPoolReason: '退回原因',
      levelOptions: {
        A: '重要客户',
        B: '普通客户',
        C: '一般客户',
        D: '低优先客户'
      },
      taxpayerOptions: {
        general: '一般纳税人',
        small: '小规模纳税人'
      },
      tabs: {
        basic: '基本信息',
        contacts: '联系人',
        follows: '跟进记录',
        opportunities: '商机',
        contracts: '合同',
        tickets: '工单'
      }
    },
    // 联系人管理
    contact: {
      title: '联系人管理',
      name: '姓名',
      gender: '性别',
      position: '职位',
      phone: '座机',
      mobile: '手机',
      email: '邮箱',
      wechat: '微信',
      isPrimary: '主要联系人',
      remark: '备注',
      male: '男',
      female: '女',
      setPrimary: '设为主联系人'
    },
    // 跟进记录
    follow: {
      title: '跟进记录',
      type: '跟进方式',
      content: '跟进内容',
      nextTime: '下次跟进时间',
      nextContent: '下次跟进内容',
      attachments: '附件',
      addFollow: '新增跟进',
      typeOptions: {
        phone: '电话',
        visit: '拜访',
        wechat: '微信',
        email: '邮件'
      }
    },
    // 商机管理
    opportunity: {
      title: '商机管理',
      name: '商机名称',
      customer: '客户',
      amount: '预计金额',
      stage: '阶段',
      expectedDate: '预计成交日期',
      winRate: '赢率',
      owner: '负责人',
      remark: '备注',
      funnel: '销售漏斗',
      tableView: '表格视图',
      boardView: '看板视图',
      stageOptions: {
        initial: '初步接触',
        requirement: '需求确认',
        proposal: '方案报价',
        negotiation: '谈判',
        won: '赢单',
        lost: '输单'
      }
    },
    // 合同管理
    contract: {
      title: '合同管理',
      contractNo: '合同编号',
      contractTitle: '合同标题',
      customer: '客户',
      amount: '合同金额',
      startDate: '开始日期',
      endDate: '结束日期',
      signDate: '签约日期',
      status: '状态',
      content: '合同内容',
      attachments: '附件',
      statusOptions: {
        draft: '草稿',
        approving: '审批中',
        signed: '已签署',
        executing: '执行中',
        completed: '已完成',
        terminated: '已终止'
      }
    },
    // 工单
    ticket: {
      title: '服务工单',
      ticketTitle: '工单标题',
      content: '工单内容',
      customer: '客户',
      priority: '优先级',
      status: '状态',
      handler: '处理人',
      resolveTime: '解决时间',
      priorityOptions: {
        low: '低',
        medium: '中',
        high: '高',
        urgent: '紧急'
      },
      statusOptions: {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决',
        closed: '已关闭'
      }
    },
    // 公海池
    pool: {
      title: '公海池',
      customer: '客户',
      returnReason: '退回原因',
      returnTime: '退回时间',
      returnBy: '退回人',
      claim: '认领',
      claimConfirm: '确定认领此客户？'
    }
  }
}
