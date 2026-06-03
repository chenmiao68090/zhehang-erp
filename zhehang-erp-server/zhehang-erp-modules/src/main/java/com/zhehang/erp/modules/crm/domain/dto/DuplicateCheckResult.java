package com.zhehang.erp.modules.crm.domain.dto;

import lombok.Data;

/**
 * 查重结果(与前端 collisionApi.checkDuplicate 期望的 DuplicateCheckResult 对齐)。
 *
 * <p>matchLevel 按命中字段优先级:P0=统一社会信用代码,P1=公司名称,P2=电话,P3=联系人姓名。</p>
 */
@Data
public class DuplicateCheckResult {

    private boolean hasDuplicate;

    /** P0 / P1 / P2 / P3,未命中为 null */
    private String matchLevel;

    /** 命中的字段名:creditCode / name / phone / contactName */
    private String matchField;

    private Long existingLeadId;

    private String existingLeadName;

    private String existingOwnerName;

    public static DuplicateCheckResult none() {
        DuplicateCheckResult r = new DuplicateCheckResult();
        r.setHasDuplicate(false);
        return r;
    }
}
