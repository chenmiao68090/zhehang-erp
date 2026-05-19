package com.zhehang.erp.modules.supply.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_vendor")
public class SupplyVendor extends BaseEntity {
    /** 供应商名称 */
    private String name;
    /** 供应商编码 */
    private String code;
    /** 联系人 */
    private String contactName;
    /** 联系电话 */
    private String contactPhone;
    /** 邮箱 */
    private String email;
    /** 地址 */
    private String address;
    /** 开户银行 */
    private String bankName;
    /** 银行账号 */
    private String bankAccount;
    /** 评级 1-5星 */
    private Integer rating;
    /** 状态 0正常 1停用 */
    private Integer status;
    /** 合作开始日期 */
    private LocalDate cooperationStart;
}
