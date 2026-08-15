package com.zhehang.erp.modules.order.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.order.domain.AddressColleagueVO;
import com.zhehang.erp.modules.order.domain.BizAddressOrder;
import com.zhehang.erp.modules.order.mapper.BizAddressOrderMapper;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/**
 * 地址业务报单/提单(挂靠地址新签报单)。
 *
 * <p>save 只暂存草稿、submit 才进入待审批；list 分页(按客户来源/管家/销售/年月筛选)、
 * detail 明细、remove 删除草稿(归属校验)。子表以 JSON 字符串原样存取。</p>
 */
@RestController
@RequestMapping("/order/address-order")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "地址报单包含法人身份证号码")
public class BizAddressOrderController {

    private final BizAddressOrderMapper addressOrderMapper;
    private final FileInfoMapper fileInfoMapper;
    private final OrderReviewService orderReviewService;
    private final SysUserMapper sysUserMapper;

    private static final Set<String> REBATE_QR_FILE_TYPES = Set.of("jpg", "jpeg", "png", "pdf");

    @GetMapping("/list")
    public R<IPage<BizAddressOrder>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String customerSource,
            @RequestParam(required = false) Long stewardId,
            @RequestParam(required = false) Long salesId,
            @RequestParam(required = false) Integer bizYear,
            @RequestParam(required = false) Integer bizMonth) {
        LambdaQueryWrapper<BizAddressOrder> qw = new LambdaQueryWrapper<BizAddressOrder>()
                // 列表不回传法人身份证号(编辑弹窗走 detail 取全量)
                .select(BizAddressOrder.class, f -> !"legal_id_card".equals(f.getColumn()))
                .like(StringUtils.hasText(keyword), BizAddressOrder::getCompanyName, keyword)
                .eq(StringUtils.hasText(customerSource), BizAddressOrder::getCustomerSource, customerSource)
                .eq(stewardId != null, BizAddressOrder::getStewardId, stewardId)
                .eq(salesId != null, BizAddressOrder::getSalesId, salesId)
                .eq(bizYear != null, BizAddressOrder::getBizYear, bizYear)
                .eq(bizMonth != null, BizAddressOrder::getBizMonth, bizMonth)
                .orderByDesc(BizAddressOrder::getId);
        IPage<BizAddressOrder> page = addressOrderMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return R.ok(page);
    }

    @GetMapping("/{id}")
    public R<BizAddressOrder> detail(@PathVariable Long id) {
        BizAddressOrder o = addressOrderMapper.selectById(id);
        if (o == null) {
            return R.fail("地址报单不存在");
        }
        return R.ok(o);
    }

    /**
     * 返款对象和收款码属于付款敏感资料，不随通用列表/详情序列化。
     * 仅报单创建人可读取；历史无创建人的订单也不因此放大读取权限。
     */
    @GetMapping("/{id}/rebate")
    public R<Map<String, Object>> rebate(@PathVariable Long id) {
        BizAddressOrder order = addressOrderMapper.selectById(id);
        if (order == null) {
            return R.fail(404, "地址报单不存在");
        }
        if (order.getCreateBy() == null
                || !Objects.equals(order.getCreateBy(), SecurityUtils.getCurrentUserId())) {
            return R.fail(403, "只能查看自己创建的地址报单返款资料");
        }
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("hasRebate", Objects.equals(order.getHasRebate(), 1) ? 1 : 0);
        result.put("rebateRecipient", order.getRebateRecipient());
        result.put("rebateAlipayQrFileId", order.getRebateAlipayQrFileId());
        return R.ok(result);
    }

    /** 服务管家/销售「选人」下拉:已开通账号的员工(userId + 姓名 + 部门)。 */
    @GetMapping("/colleagues")
    public R<List<AddressColleagueVO>> colleagues() {
        return R.ok(addressOrderMapper.selectColleagues());
    }

    @PostMapping
    @Log(module = "地址报单", type = Log.OperationType.INSERT)
    @Transactional(rollbackFor = Exception.class)
    public R<Long> save(@RequestBody BizAddressOrder o) {
        if (!StringUtils.hasText(o.getCompanyName())) {
            return R.fail(400, "暂存草稿至少需要填写企业名称");
        }
        String rebateError = normalizeAndValidateRebate(o, false);
        if (rebateError != null) {
            return R.fail(400, rebateError);
        }
        if (o.getId() == null) {
            // 客户端不能伪造待审批/已确认；新增保存永远先落草稿。
            o.setStatus("draft");
            o.setCreateBy(SecurityUtils.getCurrentUserId());
            addressOrderMapper.insert(o);
        } else {
            // 只有创建人自己的草稿/驳回单可继续编辑；已提交单不能退回草稿覆盖。
            BizAddressOrder existing = addressOrderMapper.selectById(o.getId());
            if (existing == null) {
                return R.fail(404, "地址报单不存在");
            }
            if (!canModify(existing)) {
                return R.fail(403, "只能编辑自己创建的地址报单");
            }
            if (!isEditable(existing)) {
                return R.fail(400, "该地址报单已提交，不能继续编辑");
            }
            // updateById 对 null 不更新，status=null 可确保保留服务端原状态。
            o.setStatus(null);
            o.setCreateBy(null);
            o.setUpdateBy(SecurityUtils.getCurrentUserId());
            int updated = addressOrderMapper.update(o,
                    new LambdaUpdateWrapper<BizAddressOrder>()
                            .eq(BizAddressOrder::getId, o.getId())
                            .in(BizAddressOrder::getStatus, "draft", "rejected"));
            if (updated != 1) {
                return R.fail(409, "报单状态已变化，请刷新后重试");
            }
            // MyBatis-Plus默认跳过null；返款关闭时必须显式清空对象和文件引用。
            addressOrderMapper.update(null,
                    new LambdaUpdateWrapper<BizAddressOrder>()
                            .eq(BizAddressOrder::getId, o.getId())
                            .set(BizAddressOrder::getHasRebate, o.getHasRebate())
                            .set(BizAddressOrder::getRebateRecipient, o.getRebateRecipient())
                            .set(BizAddressOrder::getRebateAlipayQrFileId, o.getRebateAlipayQrFileId()));
        }
        return R.ok(o.getId());
    }

    @PostMapping("/{id}/submit")
    @Log(module = "地址报单", type = Log.OperationType.UPDATE)
    public R<Void> submit(@PathVariable Long id) {
        BizAddressOrder existing = addressOrderMapper.selectById(id);
        if (existing == null) {
            return R.fail(404, "地址报单不存在");
        }
        if (!canModify(existing)) {
            return R.fail(403, "只能提交自己创建的地址报单");
        }
        if (!isEditable(existing)) {
            return R.fail(400, "该地址报单当前状态不能提交审批");
        }
        String submitError = validateForSubmit(existing);
        if (submitError != null) {
            return R.fail(400, submitError);
        }
        // 提交即进审单中心「合同审理」节点(主管审→财务到款确认→分配办理→验收);
        // 源单置 reviewing 由 activateFromTicket 同事务条件更新完成,并发/中间失败整体回滚。
        ReviewCreateDTO dto = new ReviewCreateDTO();
        dto.setOrderType("address");
        dto.setOrderId(existing.getId());
        dto.setOrderNo("DZ" + existing.getId());
        dto.setCustomerName(existing.getCompanyName());
        dto.setBusinessType("挂靠地址");
        dto.setReceivableAmount(existing.getCollectTotal());
        Long salesUserId = existing.getSalesId() != null ? existing.getSalesId() : existing.getCreateBy();
        dto.setSalesUserId(salesUserId);
        dto.setSalesName(existing.getSalesName());
        SysUser salesUser = salesUserId == null ? null : sysUserMapper.selectById(salesUserId);
        dto.setDeptId(salesUser == null ? null : salesUser.getDeptId());
        if (existing.getContractStart() != null || existing.getContractEnd() != null) {
            dto.setServicePeriod((existing.getContractStart() == null ? "" : existing.getContractStart().toString())
                    + " ~ " + (existing.getContractEnd() == null ? "" : existing.getContractEnd().toString()));
        }
        dto.setSalesRemark(existing.getRemark());
        orderReviewService.activateFromTicket(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "地址报单", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        BizAddressOrder existing = addressOrderMapper.selectById(id);
        if (existing == null) {
            return R.ok();
        }
        if (!canModify(existing)) {
            return R.fail(403, "只能删除自己创建的地址报单");
        }
        if (!isEditable(existing)) {
            return R.fail(400, "已提交的地址报单不能删除");
        }
        addressOrderMapper.deleteById(id);
        return R.ok();
    }

    /** 归属校验:创建人为当前用户即可改/删;历史无创建人的记录放行(不阻断)。 */
    private boolean canModify(BizAddressOrder existing) {
        Long uid = SecurityUtils.getCurrentUserId();
        Long owner = existing.getCreateBy();
        return owner == null || Objects.equals(owner, uid);
    }

    private boolean isEditable(BizAddressOrder order) {
        return "draft".equals(order.getStatus()) || "rejected".equals(order.getStatus());
    }

    private String validateForSubmit(BizAddressOrder order) {
        if (!StringUtils.hasText(order.getCompanyName())) {
            return "请填写企业名称后再提交审批";
        }
        if (!StringUtils.hasText(order.getCustomerSource())) {
            return "请选择客户来源后再提交审批";
        }
        if (!StringUtils.hasText(order.getCompanyAddress())) {
            return "请填写企业地址后再提交审批";
        }
        if (!StringUtils.hasText(order.getLegalName())) {
            return "请填写法人姓名后再提交审批";
        }
        if (!StringUtils.hasText(order.getLegalPhone())) {
            return "请填写法人联系方式后再提交审批";
        }
        if (!order.getLegalPhone().matches("\\d{11}")) {
            return "法人联系方式必须是11位手机号";
        }
        return normalizeAndValidateRebate(order, true);
    }

    /**
     * 后端是返款资料最终校验边界，不能只依赖前端展开/必填。
     * 草稿允许暂缺对象/收款码，提交审批时两项必填；已有文件始终校验归属和类型。
     */
    private String normalizeAndValidateRebate(BizAddressOrder order, boolean requireComplete) {
        if (!Objects.equals(order.getHasRebate(), 1)) {
            order.setHasRebate(0);
            order.setRebateRecipient(null);
            order.setRebateAlipayQrFileId(null);
            return null;
        }
        String recipient = order.getRebateRecipient() == null ? "" : order.getRebateRecipient().trim();
        if (requireComplete && recipient.isEmpty()) {
            return "有返款时必须填写返款对象";
        }
        if (recipient.length() > 100) {
            return "返款对象不能超过100个字符";
        }
        Long fileId = order.getRebateAlipayQrFileId();
        if (requireComplete && (fileId == null || fileId <= 0)) {
            return "有返款时必须上传支付宝收款码";
        }
        order.setHasRebate(1);
        order.setRebateRecipient(recipient.isEmpty() ? null : recipient);
        if (fileId == null || fileId <= 0) {
            order.setRebateAlipayQrFileId(null);
            return null;
        }
        FileInfo file = fileInfoMapper.selectById(fileId);
        if (file == null) {
            return "支付宝收款码文件不存在或无权访问";
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (file.getCreateBy() == null || !Objects.equals(file.getCreateBy(), currentUserId)) {
            return "支付宝收款码必须由当前操作人上传";
        }
        String fileType = file.getFileType() == null ? "" : file.getFileType().trim().toLowerCase(Locale.ROOT);
        if (!REBATE_QR_FILE_TYPES.contains(fileType)) {
            return "支付宝收款码仅支持JPG、JPEG、PNG或PDF";
        }
        return null;
    }
}
