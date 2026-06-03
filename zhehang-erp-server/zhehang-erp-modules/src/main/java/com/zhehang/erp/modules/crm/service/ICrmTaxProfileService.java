package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmTaxProfile;

public interface ICrmTaxProfileService extends IService<CrmTaxProfile> {

    /** 按统一社会信用代码获取税务档案（无则返回 null） */
    CrmTaxProfile getByCreditCode(String creditCode);

    /** 按统一社会信用代码 upsert（存在则更新，否则新增） */
    CrmTaxProfile saveOrUpdateByCreditCode(CrmTaxProfile profile);
}
