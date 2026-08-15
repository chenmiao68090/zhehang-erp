package com.zhehang.erp.modules.order.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 可选的同事(已开通账号的员工),用于服务管家/销售人员「选人」下拉。 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressColleagueVO {
    /** 员工关联的用户ID(=org_employee.user_id) */
    private Long userId;
    /** 姓名 */
    private String name;
    /** 部门名称 */
    private String deptName;
}
