package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_order_payment")
public class FeigeOrderPayment extends BaseEntity {
    private Long orderId;
    private LocalDateTime paymentTime;
    private BigDecimal amount;
    private String paymentMethod;
    private String accountNumber;
    private String status;
    private String voucher;
    private String remarks;
}
