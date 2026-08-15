package com.zhehang.erp.modules.org.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/org/dept")
@RequiredArgsConstructor
public class OrgDeptController {

    private final SysDeptMapper deptMapper;

    @GetMapping("/tree")
    public R<List<Map<String, Object>>> tree() {
        LambdaQueryWrapper<SysDept> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(SysDept::getOrderNum);
        List<SysDept> depts = deptMapper.selectList(wrapper);
        List<Map<String, Object>> tree = buildDeptTree(depts, 0L);
        return R.ok(tree);
    }

    @GetMapping("/{id}")
    public R<SysDept> getInfo(@PathVariable Long id) {
        return R.ok(deptMapper.selectById(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @Log(module = "部门管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SysDept dept) {
        // 写入祖级列表,保证部门主管"本部门及以下"数据范围对新部门生效(否则 ancestors 为空 → 找不到子孙)
        dept.setAncestors(computeAncestors(dept.getParentId()));
        deptMapper.insert(dept);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @Log(module = "部门管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SysDept dept) {
        dept.setAncestors(computeAncestors(dept.getParentId()));
        deptMapper.updateById(dept);
        return R.ok();
    }

    /** 计算祖级列表:根部门(无父)= "0";子部门 = 父的 ancestors + "," + 父ID */
    private String computeAncestors(Long parentId) {
        if (parentId == null || parentId == 0L) {
            return "0";
        }
        SysDept parent = deptMapper.selectById(parentId);
        if (parent == null) {
            return "0";
        }
        String pa = parent.getAncestors();
        return (pa == null || pa.isEmpty() ? "0" : pa) + "," + parentId;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('hr', 'boss', 'super_admin', 'sys_admin')")
    @Log(module = "部门管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        // 检查是否有子部门
        long count = deptMapper.selectCount(
                new LambdaQueryWrapper<SysDept>().eq(SysDept::getParentId, id));
        if (count > 0) {
            return R.fail("存在子部门，不允许删除");
        }
        deptMapper.deleteById(id);
        return R.ok();
    }

    private List<Map<String, Object>> buildDeptTree(List<SysDept> depts, Long parentId) {
        Map<Long, List<SysDept>> grouped = depts.stream()
                .collect(Collectors.groupingBy(SysDept::getParentId));

        List<Map<String, Object>> tree = new ArrayList<>();
        List<SysDept> children = grouped.getOrDefault(parentId, new ArrayList<>());
        for (SysDept dept : children) {
            Map<String, Object> node = new HashMap<>();
            node.put("id", dept.getId());
            node.put("parentId", dept.getParentId());
            node.put("deptName", dept.getDeptName());
            node.put("leader", dept.getLeader());
            node.put("phone", dept.getPhone());
            node.put("email", dept.getEmail());
            node.put("orderNum", dept.getOrderNum());
            node.put("status", dept.getStatus());
            node.put("children", buildDeptTree(depts, dept.getId()));
            tree.add(node);
        }
        return tree;
    }
}
