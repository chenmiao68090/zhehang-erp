package com.zhehang.erp.modules.org.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.org.domain.vo.OrgTreeVO;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.service.IOrgStructureService;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrgStructureServiceImpl implements IOrgStructureService {

    private final SysDeptMapper deptMapper;
    private final OrgEmployeeMapper employeeMapper;

    @Override
    public List<OrgTreeVO> getOrgTree() {
        // 查询所有正常部门
        LambdaQueryWrapper<SysDept> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysDept::getStatus, 0).orderByAsc(SysDept::getOrderNum);
        List<SysDept> depts = deptMapper.selectList(wrapper);

        // 一次性查所有部门在职人数,避免逐部门查询(N+1 优化:原每部门一次 count → 现一次 GROUP BY)
        Map<Long, Integer> memberCountMap = new HashMap<>();
        for (Map<String, Object> row : employeeMapper.selectMemberCountGroupByDept()) {
            Object did = row.get("deptId");
            Object cnt = row.get("cnt");
            if (did != null && cnt != null) {
                memberCountMap.put(((Number) did).longValue(), ((Number) cnt).intValue());
            }
        }

        // 转换为树节点
        List<OrgTreeVO> nodes = depts.stream().map(dept -> {
            OrgTreeVO node = new OrgTreeVO();
            node.setId(dept.getId());
            node.setParentId(dept.getParentId());
            node.setLabel(dept.getDeptName());
            node.setType("dept");
            node.setLeader(dept.getLeader());
            node.setStatus(dept.getStatus());
            // 该部门在职人数(从批量结果取,无额外查询)
            node.setMemberCount(memberCountMap.getOrDefault(dept.getId(), 0));
            return node;
        }).collect(Collectors.toList());

        // 构建树形结构
        return buildTree(nodes, 0L);
    }

    private List<OrgTreeVO> buildTree(List<OrgTreeVO> nodes, Long parentId) {
        List<OrgTreeVO> tree = new ArrayList<>();
        Map<Long, List<OrgTreeVO>> grouped = nodes.stream()
                .collect(Collectors.groupingBy(OrgTreeVO::getParentId));

        List<OrgTreeVO> children = grouped.getOrDefault(parentId, new ArrayList<>());
        for (OrgTreeVO child : children) {
            child.setChildren(buildTree(nodes, child.getId()));
            tree.add(child);
        }
        return tree;
    }
}
