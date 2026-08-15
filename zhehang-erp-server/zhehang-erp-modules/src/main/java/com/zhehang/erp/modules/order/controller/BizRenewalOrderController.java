package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.order.domain.BizRenewalOrder;
import com.zhehang.erp.modules.order.mapper.BizRenewalOrderMapper;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;
import java.util.Set;

/**
 * 续费提单(续费体系:地址续费/代账续费)。
 *
 * <p>save 新增/编辑(归属当前用户)、list 分页(按续费类型/客户来源/管家/销售/年月筛选)、
 * detail 明细、remove 删除(归属校验)。子表以 JSON 字符串原样存取,仿挂靠地址提单;
 * 额外做两条兜底校验:renewal_type 合法值、付款单位对接人号码 11 位数字。</p>
 */
@RestController
@RequestMapping("/order/renewal-order")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "续费提单包含法人身份证号码")
public class BizRenewalOrderController {

    private static final Set<String> RENEWAL_TYPES = Set.of(
            BizRenewalOrder.TYPE_ADDRESS, BizRenewalOrder.TYPE_BOOKKEEPING);
    private static final ObjectMapper JSON = new ObjectMapper();
    /** 审核中/已确认的提单锁定,禁止编辑与删除 */
    private static final Set<String> LOCKED_STATUS = Set.of("reviewing", "confirmed");

    private final BizRenewalOrderMapper renewalOrderMapper;
    private final OrderReviewService orderReviewService;
    private final SysUserMapper sysUserMapper;

    @GetMapping("/list")
    public R<IPage<BizRenewalOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam String renewalType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String customerSource,
            @RequestParam(required = false) Long stewardId,
            @RequestParam(required = false) Long salesId,
            @RequestParam(required = false) Integer bizYear,
            @RequestParam(required = false) Integer bizMonth) {
        LambdaQueryWrapper<BizRenewalOrder> qw = new LambdaQueryWrapper<BizRenewalOrder>()
                // 列表不回传法人身份证号(编辑弹窗走 detail 取全量),降低批量泄露面
                .select(BizRenewalOrder.class, f -> !"legal_id_card".equals(f.getColumn()))
                .eq(BizRenewalOrder::getRenewalType, renewalType)
                .like(StringUtils.hasText(keyword), BizRenewalOrder::getCompanyName, keyword)
                .eq(StringUtils.hasText(customerSource), BizRenewalOrder::getCustomerSource, customerSource)
                .eq(stewardId != null, BizRenewalOrder::getStewardId, stewardId)
                .eq(salesId != null, BizRenewalOrder::getSalesId, salesId)
                .eq(bizYear != null, BizRenewalOrder::getBizYear, bizYear)
                .eq(bizMonth != null, BizRenewalOrder::getBizMonth, bizMonth)
                .orderByDesc(BizRenewalOrder::getId);
        IPage<BizRenewalOrder> page = renewalOrderMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return R.ok(page);
    }

    @GetMapping("/{id}")
    public R<BizRenewalOrder> detail(@PathVariable Long id) {
        BizRenewalOrder o = renewalOrderMapper.selectById(id);
        if (o == null) {
            return R.fail("续费提单不存在");
        }
        return R.ok(o);
    }

    @PostMapping
    @Log(module = "续费提单", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody BizRenewalOrder o) {
        if (o.getRenewalType() == null || !RENEWAL_TYPES.contains(o.getRenewalType())) {
            return R.fail("续费类型不合法");
        }
        if (!StringUtils.hasText(o.getCompanyName())) {
            return R.fail("企业名称必填");
        }
        String phoneError = validatePayerPhones(o.getPayerUnits());
        if (phoneError != null) {
            return R.fail(phoneError);
        }
        if (o.getId() == null) {
            // 新增强制初始状态,并把前端可能残留回传的审计字段清掉(status/时间戳不由客户端决定)
            o.setStatus("pending");
            o.setCreateBy(SecurityUtils.getCurrentUserId());
            o.setCreateTime(null);
            o.setUpdateTime(null);
            o.setUpdateBy(null);
            renewalOrderMapper.insert(o);
        } else {
            // 归属校验:仅创建人可编辑自己的提单
            BizRenewalOrder existing = renewalOrderMapper.selectById(o.getId());
            if (existing == null) {
                return R.fail("续费提单不存在");
            }
            if (!canModify(existing)) {
                return R.fail("只能编辑自己创建的续费提单");
            }
            if (LOCKED_STATUS.contains(existing.getStatus())) {
                return R.fail("审核中或已确认的提单不能编辑");
            }
            // updateById 会跳过 null 字段导致"清空保存不生效"(本项目已咬过两次),
            // 改用 wrapper 对全部业务字段显式 set(含 null);status/createBy 不允许经此接口改。
            renewalOrderMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizRenewalOrder>()
                    .eq(BizRenewalOrder::getId, o.getId())
                    .set(BizRenewalOrder::getCompanyName, o.getCompanyName())
                    .set(BizRenewalOrder::getCustomerSource, o.getCustomerSource())
                    .set(BizRenewalOrder::getRegisterType, o.getRegisterType())
                    .set(BizRenewalOrder::getCompanyAddress, o.getCompanyAddress())
                    .set(BizRenewalOrder::getLegalName, o.getLegalName())
                    .set(BizRenewalOrder::getLegalPhone, o.getLegalPhone())
                    .set(BizRenewalOrder::getLegalIdCard, o.getLegalIdCard())
                    .set(BizRenewalOrder::getStewardId, o.getStewardId())
                    .set(BizRenewalOrder::getStewardName, o.getStewardName())
                    .set(BizRenewalOrder::getSalesId, o.getSalesId())
                    .set(BizRenewalOrder::getSalesName, o.getSalesName())
                    .set(BizRenewalOrder::getBizYear, o.getBizYear())
                    .set(BizRenewalOrder::getBizMonth, o.getBizMonth())
                    .set(BizRenewalOrder::getPayCycle, o.getPayCycle())
                    .set(BizRenewalOrder::getGiftMonths, o.getGiftMonths())
                    .set(BizRenewalOrder::getContractStart, o.getContractStart())
                    .set(BizRenewalOrder::getContractEnd, o.getContractEnd())
                    .set(BizRenewalOrder::getSupplierName, o.getSupplierName())
                    .set(BizRenewalOrder::getSupplierCompany, o.getSupplierCompany())
                    .set(BizRenewalOrder::getCostAmount, o.getCostAmount())
                    .set(BizRenewalOrder::getRebateCost, o.getRebateCost())
                    .set(BizRenewalOrder::getCollectItems, o.getCollectItems())
                    .set(BizRenewalOrder::getPayerUnits, o.getPayerUnits())
                    .set(BizRenewalOrder::getServiceItems, o.getServiceItems())
                    .set(BizRenewalOrder::getBalanceItems, o.getBalanceItems())
                    .set(BizRenewalOrder::getCollectTotal, o.getCollectTotal())
                    .set(BizRenewalOrder::getRemark, o.getRemark())
                    .set(BizRenewalOrder::getUpdateBy, SecurityUtils.getCurrentUserId())
                    .set(BizRenewalOrder::getUpdateTime, java.time.LocalDateTime.now()));
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "续费提单", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        BizRenewalOrder existing = renewalOrderMapper.selectById(id);
        if (existing == null) {
            return R.ok();
        }
        if (!canModify(existing)) {
            return R.fail("只能删除自己创建的续费提单");
        }
        if (LOCKED_STATUS.contains(existing.getStatus())) {
            return R.fail("审核中或已确认的提单不能删除");
        }
        renewalOrderMapper.deleteById(id);
        return R.ok();
    }

    /** 提交审核:进审单中心「合同审理」节点;待审批/已驳回的单可提交,提交后锁定。 */
    @PostMapping("/{id}/submit-review")
    @Log(module = "续费提单", type = Log.OperationType.UPDATE)
    public R<Long> submitReview(@PathVariable Long id) {
        BizRenewalOrder o = renewalOrderMapper.selectById(id);
        if (o == null) {
            return R.fail("续费提单不存在");
        }
        if (!canModify(o)) {
            return R.fail("只能提交自己创建的续费提单");
        }
        if (!"pending".equals(o.getStatus()) && !"rejected".equals(o.getStatus())) {
            return R.fail("只有待审批或已驳回的提单可以提交审核");
        }
        boolean isAddress = BizRenewalOrder.TYPE_ADDRESS.equals(o.getRenewalType());
        ReviewCreateDTO dto = new ReviewCreateDTO();
        // 短标识:biz_order_review.order_type 是 VARCHAR(16),renewal_bookkeeping(19字符)放不下
        dto.setOrderType(isAddress ? "renewal_addr" : "renewal_bk");
        dto.setOrderId(o.getId());
        dto.setOrderNo("XF" + o.getId());
        dto.setCustomerName(o.getCompanyName());
        dto.setBusinessType(isAddress ? "地址续费" : "代账续费");
        dto.setReceivableAmount(o.getCollectTotal());
        Long salesUserId = o.getSalesId() != null ? o.getSalesId() : o.getCreateBy();
        dto.setSalesUserId(salesUserId);
        dto.setSalesName(o.getSalesName());
        SysUser salesUser = salesUserId == null ? null : sysUserMapper.selectById(salesUserId);
        dto.setDeptId(salesUser == null ? null : salesUser.getDeptId());
        if (o.getContractStart() != null || o.getContractEnd() != null) {
            dto.setServicePeriod((o.getContractStart() == null ? "" : o.getContractStart().toString())
                    + " ~ " + (o.getContractEnd() == null ? "" : o.getContractEnd().toString()));
        }
        dto.setSalesRemark(o.getRemark());
        // 源单置 reviewing 由 activateFromTicket 同事务完成(条件更新防并发,失败整体回滚)
        return R.ok(orderReviewService.activateFromTicket(dto));
    }

    /** 付款单位对接人号码兜底校验:填了就必须是 11 位数字(前端已强校验,这里防绕过)。 */
    private String validatePayerPhones(String payerUnitsJson) {
        if (!StringUtils.hasText(payerUnitsJson)) {
            return null;
        }
        try {
            JsonNode arr = JSON.readTree(payerUnitsJson);
            if (!arr.isArray()) {
                return null;
            }
            for (JsonNode row : arr) {
                String phone = row.path("contactPhone").asText("");
                if (!phone.isEmpty() && !phone.matches("\\d{11}")) {
                    return "对接人号码必须是11位数字:" + phone;
                }
            }
            return null;
        } catch (Exception e) {
            return "付款单位信息格式有误";
        }
    }

    /** 归属校验:创建人为当前用户即可改/删;历史无创建人的记录放行(不阻断)。 */
    private boolean canModify(BizRenewalOrder existing) {
        Long uid = SecurityUtils.getCurrentUserId();
        Long owner = existing.getCreateBy();
        return owner == null || Objects.equals(owner, uid);
    }
}
