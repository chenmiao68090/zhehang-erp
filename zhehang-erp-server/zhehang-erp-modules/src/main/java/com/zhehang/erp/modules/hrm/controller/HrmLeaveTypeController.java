package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeaveType;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveTypeMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * HR·假期类型配置。列表对所有人开放(请假时要选类型),增删改仅HR/管理员/老板。
 */
@RestController
@RequestMapping("/hrm/leave-type")
@RequiredArgsConstructor
public class HrmLeaveTypeController {

    private final HrmLeaveTypeMapper leaveTypeMapper;
    private final DataScopeHelper dataScopeHelper;

    /** 假期类型列表(按展示顺序)。 */
    @GetMapping("/list")
    public R<List<HrmLeaveType>> list() {
        return R.ok(leaveTypeMapper.selectList(new LambdaQueryWrapper<HrmLeaveType>()
                .orderByAsc(HrmLeaveType::getDisplayOrder)
                .orderByAsc(HrmLeaveType::getId)));
    }

    /** 新增/编辑假期类型(有 id 则更新)。 */
    @PostMapping
    @Log(module = "假期类型", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody HrmLeaveType type) {
        if (!dataScopeHelper.isHrAdminOrBoss()) return R.fail("无权限,仅HR/管理员/老板可配置假期类型");
        if (type.getTypeName() == null || type.getTypeName().isBlank()) {
            return R.fail("请填写假期类型名");
        }
        if (type.getStatus() == null) type.setStatus(1);
        if (type.getDurationUnit() == null) type.setDurationUnit(2);
        if (type.getBalanceRule() == null) type.setBalanceRule(2);
        if (type.getDisplayOrder() == null) type.setDisplayOrder(0);
        if (type.getId() == null) {
            leaveTypeMapper.insert(type);
        } else {
            leaveTypeMapper.updateById(type);
        }
        return R.ok();
    }

    /** 启用/停用切换。 */
    @PostMapping("/{id}/toggle")
    @Log(module = "假期类型", type = Log.OperationType.UPDATE)
    public R<Void> toggle(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) return R.fail("无权限,仅HR/管理员/老板可启停假期类型");
        HrmLeaveType type = leaveTypeMapper.selectById(id);
        if (type == null) return R.fail("假期类型不存在");
        type.setStatus(type.getStatus() != null && type.getStatus() == 1 ? 0 : 1);
        leaveTypeMapper.updateById(type);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "假期类型", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) return R.fail("无权限,仅HR/管理员/老板可删除假期类型");
        leaveTypeMapper.deleteById(id);
        return R.ok();
    }
}
