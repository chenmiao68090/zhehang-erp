package com.zhehang.erp.modules.receipt.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.domain.BizRefundRequest;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.receipt.mapper.BizRefundRequestMapper;
import com.zhehang.erp.modules.receipt.service.IBizReceiptService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 退款审批流:申请→主管审批→财务确认。
 * 路径前缀 /receipt/refund(与 BizReceiptController 一步式 POST /receipt/refund 不冲突)。
 */
@RestController
@RequestMapping("/receipt/refund")
@RequiredArgsConstructor
public class BizRefundController {

    private final BizRefundRequestMapper refundMapper;
    private final IBizReceiptService receiptService;
    private final SysUserMapper userMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<BizRefundRequest>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String status) {
        LambdaQueryWrapper<BizRefundRequest> w = new LambdaQueryWrapper<>();
        // 数据范围:申请人只看自己提交的退款单;财务/管理员/老板(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(w, BizRefundRequest::getCreateBy);
        if (status != null && !status.isEmpty()) {
            w.eq(BizRefundRequest::getStatus, status);
        }
        w.orderByDesc(BizRefundRequest::getApplyTime);
        return R.ok(refundMapper.selectPage(new Page<>(page, pageSize), w));
    }

    @PostMapping("/apply")
    @Log(module = "退款审批", type = Log.OperationType.INSERT)
    public R<BizRefundRequest> apply(@RequestBody Map<String, Object> body) {
        Long receiptId = body.get("receiptId") != null ? Long.valueOf(body.get("receiptId").toString()) : null;
        BigDecimal refundAmount = body.get("refundAmount") != null ? new BigDecimal(body.get("refundAmount").toString()) : BigDecimal.ZERO;
        BizReceipt receipt = validateRefundApply(receiptId, refundAmount);
        Long operatorId = currentUserId();
        String operatorName = currentOperatorName(operatorId);

        BizRefundRequest r = new BizRefundRequest();
        r.setReceiptId(receiptId);
        r.setOrderId(body.get("orderId") != null ? Long.valueOf(body.get("orderId").toString()) : receipt.getOrderId());
        r.setOrderNo(str(body, "orderNo"));
        r.setCustomerName(StringUtils.hasText(str(body, "customerName")) ? str(body, "customerName") : receipt.getCustomerName());
        r.setRefundAmount(refundAmount);
        r.setReasonKey(str(body, "reasonKey"));
        r.setReason(str(body, "reason"));
        r.setRefundWay(body.get("refundWay") != null ? body.get("refundWay").toString() : "origin");
        r.setRefundNo(body.get("refundNo") != null ? body.get("refundNo").toString() : ("RF" + System.currentTimeMillis()));
        r.setApplicantId(operatorId);
        r.setApplicantName(operatorName);
        r.setRemark(str(body, "remark"));
        r.setApplyTime(LocalDateTime.now());
        r.setStatus("pending");
        refundMapper.insert(r);
        return R.ok(r);
    }

    @PostMapping("/{id}/approve")
    @Log(module = "退款审批", type = Log.OperationType.UPDATE)
    public R<BizRefundRequest> approve(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizRefundRequest r = refundMapper.selectById(id);
        if (r == null) {
            throw new BusinessException("退款记录不存在");
        }
        if (!"pending".equals(r.getStatus())) {
            throw new BusinessException("当前状态不可审批");
        }
        Long operatorId = currentUserId();
        String operatorName = currentOperatorName(operatorId);
        r.setStatus("approved");
        r.setApproverId(operatorId);
        r.setApproverName(operatorName);
        if (body != null) {
            if (body.get("remark") != null) {
                r.setRemark(body.get("remark").toString());
            }
        }
        r.setApprovalTime(LocalDateTime.now());
        refundMapper.updateById(r);
        return R.ok(r);
    }

    @PostMapping("/{id}/confirm")
    @Log(module = "退款审批", type = Log.OperationType.UPDATE)
    @org.springframework.transaction.annotation.Transactional
    public R<BizRefundRequest> confirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizRefundRequest r = refundMapper.selectById(id);
        if (r == null) {
            throw new BusinessException("退款记录不存在");
        }
        if (!"approved".equals(r.getStatus())) {
            throw new BusinessException("需主管审批后才可财务确认");
        }
        Long financeId = currentUserId();
        String financeName = currentOperatorName(financeId);
        // 落地真实退款:把原收款置为「已退款」(同一事务,确保与退款单状态一致)
        receiptService.refund(r.getReceiptId(), r.getRefundAmount(), r.getReason(), financeId);
        r.setStatus("completed");
        if (body != null) {
            if (body.get("refundWay") != null) {
                r.setRefundWay(body.get("refundWay").toString());
            }
            if (body.get("remark") != null) {
                r.setRemark(body.get("remark").toString());
            }
        }
        r.setFinanceConfirmerId(financeId);
        r.setFinanceConfirmerName(financeName);
        r.setFinanceConfirmTime(LocalDateTime.now());
        refundMapper.updateById(r);
        return R.ok(r);
    }

    @PostMapping("/{id}/reject")
    @Log(module = "退款审批", type = Log.OperationType.UPDATE)
    public R<BizRefundRequest> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权操作,仅管理员/主管可操作");
        }
        BizRefundRequest r = refundMapper.selectById(id);
        if (r == null) {
            throw new BusinessException("退款记录不存在");
        }
        if ("completed".equals(r.getStatus()) || "rejected".equals(r.getStatus())) {
            throw new BusinessException("当前状态不可驳回");
        }
        Long operatorId = currentUserId();
        String operatorName = currentOperatorName(operatorId);
        r.setStatus("rejected");
        r.setRejectReason(body != null && body.get("rejectReason") != null
                ? body.get("rejectReason").toString() : "未通过审批");
        if (r.getApproverId() == null) {
            r.setApproverId(operatorId);
            r.setApproverName(operatorName);
            r.setApprovalTime(LocalDateTime.now());
        }
        refundMapper.updateById(r);
        return R.ok(r);
    }

    private BizReceipt validateRefundApply(Long receiptId, BigDecimal refundAmount) {
        if (receiptId == null) {
            throw new BusinessException("请选择收款记录");
        }
        if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("退款金额必须大于0");
        }
        BizReceipt receipt = receiptService.getById(receiptId);
        if (receipt == null) {
            throw new BusinessException("收款记录不存在");
        }
        if (!Integer.valueOf(2).equals(receipt.getStatus())) {
            throw new BusinessException("只有已确认收款可以发起退款");
        }
        BigDecimal receiptAmount = receipt.getAmount() == null ? BigDecimal.ZERO : receipt.getAmount();
        if (refundAmount.compareTo(receiptAmount) > 0) {
            throw new BusinessException("退款金额不得超过实收金额");
        }
        Long activeCount = refundMapper.selectCount(new LambdaQueryWrapper<BizRefundRequest>()
                .eq(BizRefundRequest::getReceiptId, receiptId)
                .in(BizRefundRequest::getStatus, "pending", "approved"));
        if (activeCount != null && activeCount > 0) {
            throw new BusinessException("该收款已有待处理退款申请");
        }
        return receipt;
    }

    private Long currentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("请先登录");
        }
        return userId;
    }

    private String currentOperatorName(Long userId) {
        if (userId != null) {
            SysUser user = userMapper.selectById(userId);
            if (user != null) {
                if (StringUtils.hasText(user.getNickname())) {
                    return user.getNickname();
                }
                if (StringUtils.hasText(user.getUsername())) {
                    return user.getUsername();
                }
            }
        }
        String username = SecurityUtils.getCurrentUsername();
        return StringUtils.hasText(username) ? username : "当前用户";
    }

    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v != null ? v.toString() : null;
    }
}
