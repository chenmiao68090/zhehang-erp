package com.zhehang.erp.modules.review.domain.dto;

import lombok.Data;
import java.math.BigDecimal;

/** 发起审单入参:从提单页带过来的快照。 */
@Data
public class ReviewCreateDTO {
    private String orderType;
    private Long orderId;
    private String orderNo;
    private Long customerId;
    private String customerName;
    private String businessType;
    private BigDecimal receivableAmount;
    private Long salesUserId;
    private String salesName;
    private Long deptId;
    private String contractFile;
    private String servicePeriod;
    private String salesRemark;
    private String remark;
}
