package com.zhehang.erp.modules.gs.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 工商业务·工商订单与办理进度。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_gs_order")
public class BizGsOrder extends BaseEntity {
    /** 公司名称 */
    private String companyName;
    /** 业务类型:register/change/cancel/annual/bank/license/other */
    private String businessType;
    /** 业务细分项目(逗号分隔的前端枚举值) */
    private String businessItems;
    /** 业务细分补充说明/其他项目 */
    private String businessItemRemark;
    /** 客户联系人 */
    private String customer;
    /** 联系电话 */
    private String phone;
    /** 法人手机号 */
    private String legalPhone;
    /** 收件人 */
    private String recipient;
    /** 收件电话 */
    private String recipientPhone;
    /** 收件地址 */
    private String recipientAddress;
    /** 办理人(自由文本姓名,历史字段;权限归属以 assigneeId 为准) */
    private String handler;
    /** 分配的办事员 userId(审核后由分配人指定;办事员数据范围以此收敛) */
    private Long assigneeId;
    /** 收费金额 */
    private BigDecimal fee;
    /** 接单日期 */
    private LocalDate receivedDate;
    /** 办理期限 */
    private LocalDate deadline;
    /** 进度状态 */
    private String status;
    /** 办理进度说明 */
    private String progressNote;
    /** 备注 */
    private String remark;

    /** 客户资料(法人身份证/其他附件)JSON:{key:{fileId,fileName}};前端序列化,file模块负责上传下载 */
    private String documents;

    /** 办事员姓名(非数据库字段,列表回显用) */
    @TableField(exist = false)
    private String assigneeName;
}
