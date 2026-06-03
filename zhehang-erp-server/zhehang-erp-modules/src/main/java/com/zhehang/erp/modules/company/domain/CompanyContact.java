package com.zhehang.erp.modules.company.domain;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * 企业联系人（工商主体下的对接人）。
 */
@Data
@Accessors(chain = true)
public class CompanyContact {
    /** 联系人姓名 */
    private String name;
    /** 职务 */
    private String title;
    /** 联系电话 */
    private String phone;
}
