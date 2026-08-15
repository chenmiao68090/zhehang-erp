package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 可核销报单归一化 VO:把 4 张业务报单表(代账/地址/工商/刻章)统一成同一结构,
 * 供收款日记账「选报单核销」列表使用。只返回未收/部分收(unpaidAmount > 0)。
 */
@Data
public class MatchableOrderVO {
    /** 报单类型:bookkeeping/address/gs/seal */
    private String bizType;
    /** 报单类型中文标签:代账/地址/工商/刻章 */
    private String bizTypeLabel;
    /** 报单在其表内的主键ID */
    private Long bizId;
    /** 报单单号(无原生单号列时由「前缀+id」合成) */
    private String orderNo;
    /** 客户/公司名 */
    private String customerName;
    /** 销售/业务归属人 */
    private String salesName;
    /** 业务类型描述(代理记账/地址挂靠/工商办理/刻章刻制) */
    private String bizName;
    /** 应收金额(取各表金额字段) */
    private BigDecimal receivableAmount;
    /** 已收金额(= 该报单被匹配金额合计,fin_cash_match) */
    private BigDecimal receivedAmount;
    /** 未收金额(= 应收 - 已收) */
    private BigDecimal unpaidAmount;
    /** 报单日期 */
    private LocalDate orderDate;
    /** 收款状态:待收款/部分收款/已收款 */
    private String paymentStatus;
    /** 可解释推荐分数0-100。 */
    private Integer score;
    /** 推荐理由，按贡献分从高到低。 */
    private List<String> reasons;
    /** high/medium/low。 */
    private String confidenceLevel;
}
