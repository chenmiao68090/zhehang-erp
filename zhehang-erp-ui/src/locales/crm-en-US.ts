// CRM Module English i18n
export default {
  crm: {
    lead: {
      title: 'Lead Management',
      name: 'Company Name',
      company: 'Contact Person',
      phone: 'Contact Phone',
      email: 'Company Address',
      source: 'Source',
      status: 'Follow-up Status',
      owner: 'Owner',
      remark: 'Remark',
      createTime: 'Created At',
      convert: 'Convert',
      assign: 'Assign',
      convertConfirm: 'Confirm converting this lead to customer?',
      convertSuccess: 'Lead converted successfully',
      sourceOptions: {
        tianyancha: 'Tianyancha',
        referral: 'Customer Referral',
        meituan: 'Meituan Ops',
        douyin: 'Douyin Ops',
        offline: 'Walk-in'
      },
      statusOptions: {
        newCustomer: '0 New Customer',
        initialContact: 'A Initial Contact',
        requirementConfirm: 'B Requirement Confirm',
        proposal: 'C Proposal',
        negotiation: 'D Negotiation',
        closed: 'E Closed Won'
      },
      // Pool Management
      pool: 'Lead Pool',
      myLeads: 'My Leads',
      allLeads: 'All Leads',
      claim: 'Claim',
      claimSuccess: 'Claimed successfully',
      returnPool: 'Return to Pool',
      returnReason: 'Return Reason',
      returnSuccess: 'Returned successfully',
      distribute: 'Distribute',
      distributeTo: 'Distribute to',
      distributeSuccess: 'Distributed successfully',
      moreActions: 'More',
      importBtn: 'Import',
      exportBtn: 'Export',
      poolRules: 'Pool Rules',
      duplicateCheck: 'Duplicate Check',
      lastFollowTime: 'Last Follow-up',
      ownerName: 'Owner',
      // Batch Operations
      batchClaim: 'Batch Claim',
      batchReturn: 'Batch Return',
      batchDistribute: 'Batch Distribute',
      batchDelete: 'Batch Delete',
      selectAtLeast: 'Please select at least one record',
      // Pool Rules
      rules: {
        title: 'Pool Rules Settings',
        assignRules: 'Assignment Rules',
        reclaimRules: 'Auto-reclaim Rules',
        ruleName: 'Rule Name',
        trigger: 'Trigger',
        triggerOptions: {
          newLead: 'New lead enters pool',
          manual: 'Manual trigger'
        },
        assignMethod: 'Assignment Method',
        methodOptions: {
          roundRobin: 'Round Robin',
          byCapacity: 'By Capacity',
          specified: 'Specified Person'
        },
        assignTarget: 'Assign To',
        maxHold: 'Max Hold',
        priority: 'Priority',
        enabled: 'Enabled',
        disabled: 'Disabled',
        reclaimCondition: 'Reclaim Condition',
        conditionOptions: {
          noFollow: 'No follow-up auto-reclaim',
          noConvert: 'No conversion auto-reclaim',
          overCapacity: 'Over capacity reclaim'
        },
        days: 'days',
        scope: 'Scope',
        scopeOptions: {
          all: 'All Members',
          dept: 'Specified Department',
          person: 'Specified Person'
        },
        addRule: 'Add Rule',
        deleteRule: 'Delete Rule',
        saveSuccess: 'Rules saved successfully',
        noRules: 'No rules yet, click button below to add'
      },
      // Import
      importDialog: {
        title: 'Import Leads',
        downloadTpl: 'Download Template',
        selectFile: 'Select File',
        preview: 'Data Preview',
        confirm: 'Confirm Import',
        success: 'Import successful',
        uploadTip: 'Supports .csv, .xlsx format',
        mapping: 'Field Mapping'
      },
      exportSuccess: 'Export successful',
      // Duplicate Check
      duplicate: {
        title: 'Duplicate Check',
        searchBy: 'Search By',
        phone: 'Phone',
        name: 'Lead Name',
        search: 'Check Duplicates',
        result: 'Results',
        found: 'Duplicates found',
        noFound: 'No duplicates found',
        duplicateCount: 'Duplicate Count'
      }

    },
    customer: {
      title: 'Customer Management',
      name: 'Customer Name',
      shortName: 'Short Name',
      industry: 'Industry',
      scale: 'Scale',
      source: 'Source',
      level: 'Level',
      taxpayerType: 'Taxpayer Type',
      creditCode: 'Credit Code',
      address: 'Address',
      website: 'Website',
      status: 'Status',
      owner: 'Owner',
      servicePackage: 'Service Package',
      billingCycle: 'Billing Cycle',
      remark: 'Remark',
      createTime: 'Created At',
      toPool: 'Return to Pool',
      toPoolConfirm: 'Confirm returning this customer to public pool?',
      toPoolReason: 'Return Reason',
      levelOptions: {
        A: 'VIP',
        B: 'Normal',
        C: 'General',
        D: 'Low Priority'
      },
      taxpayerOptions: {
        general: 'General Taxpayer',
        small: 'Small-scale Taxpayer'
      },
      tabs: {
        basic: 'Basic Info',
        contacts: 'Contacts',
        follows: 'Follow Records',
        opportunities: 'Opportunities',
        contracts: 'Contracts',
        tickets: 'Tickets'
      }
    },
    contact: {
      title: 'Contact Management',
      name: 'Name',
      gender: 'Gender',
      position: 'Position',
      phone: 'Phone',
      mobile: 'Mobile',
      email: 'Email',
      wechat: 'WeChat',
      isPrimary: 'Primary Contact',
      remark: 'Remark',
      male: 'Male',
      female: 'Female',
      setPrimary: 'Set as Primary'
    },
    follow: {
      title: 'Follow Records',
      type: 'Follow Type',
      content: 'Content',
      nextTime: 'Next Follow Time',
      nextContent: 'Next Follow Content',
      attachments: 'Attachments',
      addFollow: 'Add Follow',
      typeOptions: {
        phone: 'Phone',
        visit: 'Visit',
        wechat: 'WeChat',
        email: 'Email'
      }
    },
    opportunity: {
      title: 'Opportunity Management',
      name: 'Opportunity Name',
      customer: 'Customer',
      amount: 'Amount',
      stage: 'Stage',
      expectedDate: 'Expected Close Date',
      winRate: 'Win Rate',
      owner: 'Owner',
      remark: 'Remark',
      funnel: 'Sales Funnel',
      tableView: 'Table View',
      boardView: 'Board View',
      stageOptions: {
        initial: 'Initial Contact',
        requirement: 'Requirement',
        proposal: 'Proposal',
        negotiation: 'Negotiation',
        won: 'Won',
        lost: 'Lost'
      }
    },
    contract: {
      title: 'Contract Management',
      contractNo: 'Contract No.',
      contractTitle: 'Title',
      customer: 'Customer',
      amount: 'Amount',
      startDate: 'Start Date',
      endDate: 'End Date',
      signDate: 'Sign Date',
      status: 'Status',
      content: 'Content',
      attachments: 'Attachments',
      statusOptions: {
        draft: 'Draft',
        approving: 'Approving',
        signed: 'Signed',
        executing: 'Executing',
        completed: 'Completed',
        terminated: 'Terminated'
      }
    },
    ticket: {
      title: 'Service Tickets',
      ticketTitle: 'Ticket Title',
      content: 'Content',
      customer: 'Customer',
      priority: 'Priority',
      status: 'Status',
      handler: 'Handler',
      resolveTime: 'Resolve Time',
      priorityOptions: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      statusOptions: {
        pending: 'Pending',
        processing: 'Processing',
        resolved: 'Resolved',
        closed: 'Closed'
      }
    },
    pool: {
      title: 'Public Pool',
      customer: 'Customer',
      returnReason: 'Return Reason',
      returnTime: 'Return Time',
      returnBy: 'Returned By',
      claim: 'Claim',
      claimConfirm: 'Confirm claiming this customer?'
    }
  }
}
