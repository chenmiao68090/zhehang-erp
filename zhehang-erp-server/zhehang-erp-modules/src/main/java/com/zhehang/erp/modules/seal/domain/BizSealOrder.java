package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 刻章业务·每日刻章客户登记。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_order")
public class BizSealOrder extends BaseEntity {
    /** 登记日期(提单日期) */
    private LocalDate regDate;
    /** 业绩归属部门 */
    private String perfDept;
    /** 业务归属人(默认提交人) */
    private String ownerName;
    /** 业务类型:new新客户/old老客户 */
    private String bizType;
    /** 老客户时关联的长期合作客户ID */
    private Long partnerId;
    /** 提单年份(由提单日期自动) */
    private String billYear;
    /** 提单月份(由提单日期自动) */
    private String billMonth;
    /** 公司名称 */
    private String companyName;
    /** 法人 */
    private String legalPerson;
    /** 联系电话 */
    private String phone;
    /** 身份证正面照片URL */
    private String idCardFront;
    /** 身份证反面照片URL */
    private String idCardBack;
    /** 刻章类型(逗号分隔,随材质联动) */
    private String sealTypes;
    /** 印章状态(新设刻章/变更刻章/损坏重刻/遗失声明/遗失登报/萝卜章/仅备案) */
    private String sealStatus;
    /** 备案状态(备案刻章/仅备案/萝卜章/仅登报) */
    private String recordStatus;
    /** 刻章城市(杭州及外区域) */
    private String sealCity;
    /** 印章材质(光敏/牛角/回墨) */
    private String sealMaterial;
    /** 收费金额 */
    private BigDecimal fee;
    /** 收款账号 */
    private String payAccount;
    /** 客户支付宝收款码(fileId,退款/返点给客户打款用) */
    private String customerAlipayQr;
    /** 外区域备案费(手动可填,默认按25元/个估算) */
    private BigDecimal outRegionFee;
    /** 收款方式(待结算/浙杭刻章码丨微信…等) */
    private String payMethod;
    /** 具体收款日期 */
    private LocalDate payDate;
    /** 收件人 */
    private String recipient;
    /** 收件地址 */
    private String address;
    /** 是否邮寄:1是 0否 */
    private Integer isMail;
    /** 是否备案:1是 0否 */
    private Integer isRecord;
    /** 是否寄出:1是 0否 */
    private Integer isShipped;
    /** 快递单号 */
    private String trackingNo;
    /** 是否交付:1是 0否 */
    private Integer isDelivered;
    /** 办理人是否法人本人:1是 0否 */
    private Integer handlerIsLegal;
    /** 遗失登报时是否我们登报:1是 0否 */
    private Integer isWePublish;
    /** 资料附件 JSON:{docType:{fileId,fileName}} */
    private String documents;
    /** 快递/邮寄类型 */
    private String deliveryType;
    /** 登报费用 */
    private BigDecimal publishFee;
    /** 运营成本合计 */
    private BigDecimal opCostTotal;
    /** 是否需要开具发票:1是 0否 */
    private Integer needInvoice;
    /** 开票信息 */
    private String invoiceInfo;
    /** 开票是否已完成:1是 0否 */
    private Integer invoiceDone;
    /** 业务支出·返点成本 */
    private BigDecimal rebateCost;
    /** 业务支出·刻章退款 */
    private BigDecimal refundAmount;
    /** 状态:pending/engraved/mailed/done */
    private String status;
    /** 萝卜章已确认(私下刻制风险提示已确认):1=是 */
    private Integer luoboConfirmed;
    /** 备注 */
    private String remark;
}
