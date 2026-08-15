package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.mapper.FinanceReimburseMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReimburseService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class FinanceReimburseServiceImpl extends ServiceImpl<FinanceReimburseMapper, FinanceReimburse> implements IFinanceReimburseService {

    private final DataScopeHelper dataScopeHelper;

    public IPage<FinanceReimburse> selectPage(Integer pageNum, Integer pageSize, String reimburseNo, Long applicantId, Integer status) {
        LambdaQueryWrapper<FinanceReimburse> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:报销按创建人(=申请人)收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, FinanceReimburse::getCreateBy);
        wrapper.like(StringUtils.hasText(reimburseNo), FinanceReimburse::getReimburseNo, reimburseNo)
               .eq(applicantId != null, FinanceReimburse::getApplicantId, applicantId)
               .eq(status != null, FinanceReimburse::getStatus, status)
               .orderByDesc(FinanceReimburse::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void approve(Long id, boolean approved) {
        FinanceReimburse reimburse = getById(id);
        if (reimburse.getStatus() != 1) {
            throw new BusinessException("Only pending reimbursements can be approved");
        }
        reimburse.setStatus(approved ? 2 : 3);
        updateById(reimburse);
    }

    public void pay(Long id) {
        FinanceReimburse reimburse = getById(id);
        if (reimburse.getStatus() != 2) {
            throw new BusinessException("Only approved reimbursements can be paid");
        }
        reimburse.setStatus(4);
        updateById(reimburse);
    }
}
