package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;
import com.zhehang.erp.modules.finance.mapper.FinExpenseMapper;
import com.zhehang.erp.modules.finance.service.IFinExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/** 业务支出 Service 实现。含金额/预算等信息,按创建人收敛数据范围。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FinExpenseServiceImpl implements IFinExpenseService {

    private final FinExpenseMapper expenseMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<FinExpense> expenseList(int pageNum, int pageSize,
                                         String keyword, String category, String status) {
        LambdaQueryWrapper<FinExpense> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, FinExpense::getCreateBy);
        wrapper.and(StringUtils.hasText(keyword), w -> w
                        .like(FinExpense::getExpenseNo, keyword)
                        .or().like(FinExpense::getProject, keyword))
                .eq(StringUtils.hasText(category), FinExpense::getCategory, category)
                .eq(StringUtils.hasText(status), FinExpense::getStatus, status)
                .orderByDesc(FinExpense::getCreateTime);
        return expenseMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveExpense(FinExpense entity) {
        if (entity.getId() == null) {
            if (!StringUtils.hasText(entity.getExpenseNo())) {
                entity.setExpenseNo("EX" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(entity.getStatus())) {
                entity.setStatus("approving");
            }
            expenseMapper.insert(entity);
        } else {
            expenseMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Override
    public void removeExpense(Long id) {
        expenseMapper.deleteById(id);
    }

    @Override
    public void changeStatus(Long id, String status) {
        FinExpense entity = expenseMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException("业务支出单据不存在");
        }
        entity.setStatus(status);
        expenseMapper.updateById(entity);
    }
}
