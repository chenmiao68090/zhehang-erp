package com.zhehang.erp.modules.renewal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.renewal.domain.BizAddressRenewal;
import com.zhehang.erp.modules.renewal.domain.BizAddressRenewalFollow;
import com.zhehang.erp.modules.renewal.mapper.BizAddressRenewalFollowMapper;
import com.zhehang.erp.modules.renewal.mapper.BizAddressRenewalMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 地址续费资源库 + 催收跟进。
 * 权限:全员可见全部(不隔离);跟进可新增、仅改本人、永久不可删(操作人后端强制留痕)。
 */
@RestController
@RequestMapping("/address-renewal")
@RequiredArgsConstructor
public class AddressRenewalController {

    private final BizAddressRenewalMapper renewalMapper;
    private final BizAddressRenewalFollowMapper followMapper;

    /* ---------- 续费记录 ---------- */

    @GetMapping("/list")
    public R<IPage<BizAddressRenewal>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String payStatus,
            @RequestParam(required = false) String renewStatus,
            @RequestParam(required = false) String expireMonth) {
        LambdaQueryWrapper<BizAddressRenewal> qw = new LambdaQueryWrapper<BizAddressRenewal>()
                .like(StringUtils.hasText(keyword), BizAddressRenewal::getCompanyName, keyword)
                .eq(StringUtils.hasText(payStatus), BizAddressRenewal::getPayStatus, payStatus)
                .eq(StringUtils.hasText(renewStatus), BizAddressRenewal::getRenewStatus, renewStatus)
                .eq(StringUtils.hasText(expireMonth), BizAddressRenewal::getExpireMonth, expireMonth)
                .orderByDesc(BizAddressRenewal::getExpireDate)
                .orderByDesc(BizAddressRenewal::getId);
        return R.ok(renewalMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "地址续费", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizAddressRenewal data) {
        if (data.getPayStatus() == null || data.getPayStatus().isBlank()) {
            data.setPayStatus("unpaid");
        }
        renewalMapper.insert(data);
        return R.ok();
    }

    @PutMapping
    @Log(module = "地址续费", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizAddressRenewal data) {
        renewalMapper.updateById(data);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "地址续费", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        renewalMapper.deleteById(id);
        return R.ok();
    }

    /* ---------- 催收跟进 ---------- */

    @GetMapping("/{id}/follows")
    public R<List<BizAddressRenewalFollow>> follows(@PathVariable Long id) {
        return R.ok(followMapper.selectList(new LambdaQueryWrapper<BizAddressRenewalFollow>()
                .eq(BizAddressRenewalFollow::getRenewalId, id)
                .orderByDesc(BizAddressRenewalFollow::getCreateTime)
                .orderByDesc(BizAddressRenewalFollow::getId)));
    }

    /** 新增跟进:操作人由后端强制写入当前登录用户,防代填造假。 */
    @PostMapping("/follow")
    @Log(module = "地址续费", type = Log.OperationType.INSERT)
    public R<Void> addFollow(@RequestBody BizAddressRenewalFollow follow) {
        if (follow.getRenewalId() == null) {
            return R.fail("缺少所属续费记录");
        }
        follow.setId(null);
        follow.setOperatorId(SecurityUtils.getCurrentUserId());
        follow.setOperatorName(SecurityUtils.getCurrentUsername());
        followMapper.insert(follow);
        return R.ok();
    }

    /** 修改跟进:仅允许改本人创建的(operator_id 必须等于当前登录人);不提供删除。 */
    @PutMapping("/follow")
    @Log(module = "地址续费", type = Log.OperationType.UPDATE)
    public R<Void> editFollow(@RequestBody BizAddressRenewalFollow follow) {
        if (follow.getId() == null) {
            return R.fail("缺少跟进ID");
        }
        BizAddressRenewalFollow exist = followMapper.selectById(follow.getId());
        if (exist == null) {
            return R.fail("跟进记录不存在");
        }
        Long uid = SecurityUtils.getCurrentUserId();
        if (exist.getOperatorId() != null && !exist.getOperatorId().equals(uid)) {
            return R.fail("只能修改本人创建的跟进记录");
        }
        // 操作人留痕不可被改写
        follow.setOperatorId(exist.getOperatorId());
        follow.setOperatorName(exist.getOperatorName());
        follow.setRenewalId(exist.getRenewalId());
        followMapper.updateById(follow);
        return R.ok();
    }
}
