package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmContract;
import com.zhehang.erp.modules.crm.mapper.CrmContractMapper;
import com.zhehang.erp.modules.crm.service.ICrmContractService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CrmContractServiceImpl extends ServiceImpl<CrmContractMapper, CrmContract> implements ICrmContractService {

    private final CrmContractMapper contractMapper;
    private final SysUserMapper userMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<CrmContract> selectPage(int pageNum, int pageSize, String contractNo, Long customerId, Integer status) {
        LambdaQueryWrapper<CrmContract> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:合同按创建人收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, CrmContract::getCreateBy);
        wrapper.like(StringUtils.hasText(contractNo), CrmContract::getContractNo, contractNo)
               .eq(customerId != null, CrmContract::getCustomerId, customerId)
               .eq(status != null, CrmContract::getStatus, status)
               .orderByDesc(CrmContract::getCreateTime);
        return contractMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void changeStatus(Long id, Integer status) {
        CrmContract contract = contractMapper.selectById(id);
        if (contract == null) {
            throw new BusinessException("合同不存在");
        }
        contract.setStatus(status);
        contractMapper.updateById(contract);
    }

    @Override
    public List<Map<String, Object>> performanceByOwner(Integer year, Integer status) {
        QueryWrapper<CrmContract> qw = new QueryWrapper<>();
        qw.select("create_by AS ownerId",
                  "COUNT(*) AS contractCount",
                  "COALESCE(SUM(amount), 0) AS contractAmount");
        if (year != null) {
            qw.apply("YEAR(sign_date) = {0}", year);
        }
        if (status != null) {
            qw.eq("status", status);
        }
        qw.isNotNull("create_by").groupBy("create_by");
        List<Map<String, Object>> rows = contractMapper.selectMaps(qw);
        if (rows == null || rows.isEmpty()) {
            return new ArrayList<>();
        }
        // 解析签订人姓名
        List<Long> ownerIds = rows.stream()
                .map(r -> r.get("ownerId"))
                .filter(java.util.Objects::nonNull)
                .map(o -> Long.valueOf(o.toString()))
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> nameMap = new HashMap<>();
        if (!ownerIds.isEmpty()) {
            List<SysUser> users = userMapper.selectBatchIds(ownerIds);
            for (SysUser u : users) {
                nameMap.put(u.getId(), StringUtils.hasText(u.getNickname()) ? u.getNickname() : u.getUsername());
            }
        }
        for (Map<String, Object> row : rows) {
            Object oid = row.get("ownerId");
            Long id = oid == null ? null : Long.valueOf(oid.toString());
            row.put("ownerName", id != null && nameMap.containsKey(id) ? nameMap.get(id) : ("用户" + oid));
        }
        return rows;
    }

    @Override
    public List<Map<String, Object>> monthlyTrend(Integer year) {
        int y = year != null ? year : java.time.LocalDate.now().getYear();
        QueryWrapper<CrmContract> qw = new QueryWrapper<>();
        qw.select("MONTH(sign_date) AS m",
                  "COUNT(*) AS contractCount",
                  "COALESCE(SUM(amount), 0) AS contractAmount");
        qw.apply("YEAR(sign_date) = {0}", y)
          .isNotNull("sign_date")
          .groupBy("MONTH(sign_date)");
        List<Map<String, Object>> raw = contractMapper.selectMaps(qw);
        // 按月补零成 12 行
        Map<Integer, Map<String, Object>> byMonth = new HashMap<>();
        if (raw != null) {
            for (Map<String, Object> r : raw) {
                Object m = r.get("m");
                if (m != null) byMonth.put(Integer.valueOf(m.toString()), r);
            }
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> row = new HashMap<>();
            row.put("month", m);
            Map<String, Object> hit = byMonth.get(m);
            row.put("contractCount", hit != null ? hit.get("contractCount") : 0);
            row.put("contractAmount", hit != null ? hit.get("contractAmount") : 0);
            result.add(row);
        }
        return result;
    }
}
