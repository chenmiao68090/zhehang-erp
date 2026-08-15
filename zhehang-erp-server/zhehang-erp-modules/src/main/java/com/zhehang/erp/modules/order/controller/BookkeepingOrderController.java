package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.order.domain.BizBookkeepingOrder;
import com.zhehang.erp.modules.order.mapper.BizBookkeepingOrderMapper;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * 代理记账提单。
 */
@RestController
@RequestMapping("/bookkeeping-order")
@RequiredArgsConstructor
public class BookkeepingOrderController {

    /** 审核中/已确认的提单锁定,禁止编辑与删除 */
    private static final Set<String> LOCKED_STATUS = Set.of("reviewing", "confirmed");

    private final BizBookkeepingOrderMapper bookkeepingOrderMapper;
    private final com.zhehang.erp.modules.crm.support.DataScopeHelper dataScopeHelper;
    private final OrderReviewService orderReviewService;
    private final SysUserMapper sysUserMapper;

    @GetMapping("/list")
    public R<List<BizBookkeepingOrder>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<BizBookkeepingOrder> qw = new LambdaQueryWrapper<BizBookkeepingOrder>()
                .like(StringUtils.hasText(keyword), BizBookkeepingOrder::getCompanyName, keyword)
                .orderByDesc(BizBookkeepingOrder::getId);
        // 数据范围:代账报单无 dept_id/owner_id,按建单人(create_by)收敛——老板全部、主管本部门建单、员工本人
        dataScopeHelper.applyByVisibleUsers(qw, BizBookkeepingOrder::getCreateBy);
        return R.ok(bookkeepingOrderMapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "代理记账提单", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody BizBookkeepingOrder o) {
        if (o.getId() == null) {
            // 新增强制初始状态(原实现由前端传 status,可被伪造)
            o.setStatus("pending");
            o.setCreateBy(SecurityUtils.getCurrentUserId());
            o.setCreateTime(null);
            o.setUpdateTime(null);
            o.setUpdateBy(null);
            bookkeepingOrderMapper.insert(o);
        } else {
            BizBookkeepingOrder existing = bookkeepingOrderMapper.selectById(o.getId());
            if (existing == null) {
                return R.fail("代账提单不存在");
            }
            if (!canModify(existing)) {
                return R.fail("只能编辑自己创建的代账提单");
            }
            if (LOCKED_STATUS.contains(existing.getStatus())) {
                return R.fail("审核中或已确认的提单不能编辑");
            }
            // wrapper 显式 set 业务字段:防清空不生效(updateById跳null)与偷带 status/createBy/tenantId
            bookkeepingOrderMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<BizBookkeepingOrder>()
                    .eq(BizBookkeepingOrder::getId, o.getId())
                    .set(BizBookkeepingOrder::getLeadId, o.getLeadId())
                    .set(BizBookkeepingOrder::getCompanyName, o.getCompanyName())
                    .set(BizBookkeepingOrder::getContactName, o.getContactName())
                    .set(BizBookkeepingOrder::getPhone, o.getPhone())
                    .set(BizBookkeepingOrder::getCreditCode, o.getCreditCode())
                    .set(BizBookkeepingOrder::getContractAmount, o.getContractAmount())
                    .set(BizBookkeepingOrder::getServiceStart, o.getServiceStart())
                    .set(BizBookkeepingOrder::getServiceEnd, o.getServiceEnd())
                    .set(BizBookkeepingOrder::getSignDate, o.getSignDate())
                    .set(BizBookkeepingOrder::getPayMethod, o.getPayMethod())
                    .set(BizBookkeepingOrder::getServiceContent, o.getServiceContent())
                    .set(BizBookkeepingOrder::getContractFile, o.getContractFile())
                    .set(BizBookkeepingOrder::getOwnerName, o.getOwnerName())
                    .set(BizBookkeepingOrder::getRemark, o.getRemark())
                    .set(BizBookkeepingOrder::getCompanyNature, o.getCompanyNature())
                    .set(BizBookkeepingOrder::getCoopPeriod, o.getCoopPeriod())
                    .set(BizBookkeepingOrder::getCoopStart, o.getCoopStart())
                    .set(BizBookkeepingOrder::getCoopEnd, o.getCoopEnd())
                    .set(BizBookkeepingOrder::getRegAddress, o.getRegAddress())
                    .set(BizBookkeepingOrder::getRegAddressOwner, o.getRegAddressOwner())
                    .set(BizBookkeepingOrder::getBookkeepingAmount, o.getBookkeepingAmount())
                    .set(BizBookkeepingOrder::getSpecialRemark, o.getSpecialRemark())
                    .set(BizBookkeepingOrder::getUpdateBy, SecurityUtils.getCurrentUserId())
                    .set(BizBookkeepingOrder::getUpdateTime, java.time.LocalDateTime.now()));
        }
        return R.ok();
    }

    /** 归属校验:创建人为当前用户即可改/删/提交;历史无创建人的记录放行(不阻断)。 */
    private boolean canModify(BizBookkeepingOrder existing) {
        Long uid = SecurityUtils.getCurrentUserId();
        Long owner = existing.getCreateBy();
        return owner == null || java.util.Objects.equals(owner, uid);
    }

    /** 提交审核:进审单中心「合同审理」节点;待审批/已驳回的单可提交,提交后锁定。 */
    @PostMapping("/{id}/submit-review")
    @Log(module = "代理记账提单", type = Log.OperationType.UPDATE)
    public R<Long> submitReview(@PathVariable Long id) {
        BizBookkeepingOrder o = bookkeepingOrderMapper.selectById(id);
        if (o == null) {
            return R.fail("代账提单不存在");
        }
        if (!canModify(o)) {
            return R.fail("只能提交自己创建的代账提单");
        }
        if (o.getStatus() != null && !"pending".equals(o.getStatus()) && !"rejected".equals(o.getStatus())) {
            return R.fail("只有待处理或已驳回的提单可以提交审核");
        }
        ReviewCreateDTO dto = new ReviewCreateDTO();
        dto.setOrderType("bookkeeping");
        dto.setOrderId(o.getId());
        dto.setOrderNo("JZ" + o.getId());
        dto.setCustomerName(o.getCompanyName());
        dto.setBusinessType("代理记账");
        dto.setReceivableAmount(o.getContractAmount());
        dto.setSalesUserId(o.getCreateBy());
        SysUser salesUser = o.getCreateBy() == null ? null : sysUserMapper.selectById(o.getCreateBy());
        dto.setDeptId(salesUser == null ? null : salesUser.getDeptId());
        dto.setSalesName(salesUser == null ? null
                : (StringUtils.hasText(salesUser.getNickname()) ? salesUser.getNickname() : salesUser.getUsername()));
        if (o.getServiceStart() != null || o.getServiceEnd() != null) {
            dto.setServicePeriod((o.getServiceStart() == null ? "" : o.getServiceStart().toString())
                    + " ~ " + (o.getServiceEnd() == null ? "" : o.getServiceEnd().toString()));
        }
        dto.setContractFile(o.getContractFile());
        // 源单置 reviewing 由 activateFromTicket 同事务完成(条件更新防并发,失败整体回滚)
        return R.ok(orderReviewService.activateFromTicket(dto));
    }

    @DeleteMapping("/{id}")
    @Log(module = "代理记账提单", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        BizBookkeepingOrder existing = bookkeepingOrderMapper.selectById(id);
        if (existing == null) {
            return R.ok();
        }
        if (LOCKED_STATUS.contains(existing.getStatus())) {
            return R.fail("审核中或已确认的提单不能删除");
        }
        bookkeepingOrderMapper.deleteById(id);
        return R.ok();
    }
}
