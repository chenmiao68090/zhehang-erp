package com.zhehang.erp.modules.receipt.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.receipt.domain.BizInvoice;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.domain.BizReceiptPlan;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface IBizReceiptService extends IService<BizReceipt> {

    /** 收款列表 */
    IPage<BizReceipt> selectPage(int pageNum, int pageSize, Long customerId, Long orderId, Integer status);

    /** 确认收款 */
    void confirm(BizReceipt receipt, Long operatorId);

    /** 获取订单收款计划 */
    List<BizReceiptPlan> getPlans(Long orderId);

    /** 标记某期已付 */
    void payPlan(Long planId, BigDecimal amount);

    /** 逾期收款列表 */
    List<BizReceiptPlan> getOverdue();

    /** 退款申请 */
    void refund(Long receiptId, BigDecimal refundAmount, String reason, Long operatorId);

    /** 驳回收款(置状态=4 已驳回,原因记入备注) */
    void reject(Long receiptId, String reason, Long operatorId);

    /** 标记收款入账 */
    BizReceipt postReceipt(Long receiptId, String postingAccount, Long operatorId);

    /** 发票分页 */
    IPage<BizInvoice> getInvoices(int pageNum, int pageSize, Long customerId, Integer status);

    /** 创建发票 */
    Long createInvoice(BizInvoice invoice);

    /** 更新发票状态 */
    void updateInvoiceStatus(Long id, Integer status, String trackingNo);

    /** 月度汇总 */
    Map<String, Object> monthlySummary(String month);
}
