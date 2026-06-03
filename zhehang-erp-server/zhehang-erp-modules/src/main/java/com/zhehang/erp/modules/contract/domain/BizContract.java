package com.zhehang.erp.modules.contract.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 业务合同实体(基于订单生成)
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_contract")
public class BizContract extends BaseEntity {
    /** 合同编号 */
    private String contractNo;
    /** 合同标题 */
    private String title;
    /** 关联订单ID */
    private Long orderId;
    /** 客户ID */
    private Long customerId;
    /** 客户名称 */
    private String customerName;
    /** 模板ID */
    private Long templateId;
    /** 合同类型(new首签 renew续签 supplement补充) */
    private String contractType;
    /** 父合同ID(续签/补充时关联) */
    private Long parentId;
    /** 合同金额 */
    private BigDecimal amount;
    /** 开始日期 */
    private LocalDate startDate;
    /** 结束日期 */
    private LocalDate endDate;
    /** 签约日期 */
    private LocalDate signDate;
    /** 状态(1草稿 2待签署 3签署中 4已签署 5执行中 6已到期 7已终止) */
    private Integer status;
    /** 签署方式(online线上 offline线下) */
    private String signMode;
    /** 我方签署人 */
    private String signerOurs;
    /** 对方签署人 */
    private String signerTheirs;
    /** 发送签署时间 */
    private LocalDateTime sendSignTime;
    /** 完成签署时间 */
    private LocalDateTime confirmSignTime;
    /** 终止时间 */
    private LocalDateTime terminateTime;
    /** 终止原因 */
    private String terminateReason;
    /** 合同正文 */
    private String content;
    /** 附件 */
    private String attachments;
    /** 备注 */
    private String remark;
}
