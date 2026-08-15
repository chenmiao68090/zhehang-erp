package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 收款中心-收款渠道(微信收款码/支付宝/银行收款码一码通/对公账户)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_pay_channel")
public class FinPayChannel extends BaseEntity {

    /** 渠道类型:wechat/alipay/bank_qr/bank_account */
    private String channelType;

    /** 渠道名称(如:丰收一码通/浙杭微信) */
    private String channelName;

    /** 账号/商户号(对公填银行账号) */
    private String accountNo;

    /** 对应收款登记「收款账号」选项,认领时自动带入 */
    private String receiveAccount;

    /** 收款码图片附件 JSON 数组[{fileId,fileName}] */
    private String qrFile;

    /** 状态:1启用 0停用 */
    private Integer status;

    /** 排序(小在前) */
    private Integer sort;

    private String remark;
}
