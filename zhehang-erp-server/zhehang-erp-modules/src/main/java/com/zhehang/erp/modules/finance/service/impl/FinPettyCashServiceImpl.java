package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinPettyCash;
import com.zhehang.erp.modules.finance.mapper.FinPettyCashMapper;
import com.zhehang.erp.modules.finance.service.IFinPettyCashService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/** 备用金 Service 实现。含金额/账期等信息,按创建人收敛数据范围(同 reimburse 口径)。 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FinPettyCashServiceImpl implements IFinPettyCashService {

    private final FinPettyCashMapper pettyCashMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<FinPettyCash> pettyCashList(int pageNum, int pageSize,
                                             String keyword, String status) {
        LambdaQueryWrapper<FinPettyCash> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, FinPettyCash::getCreateBy);
        wrapper.and(StringUtils.hasText(keyword), w -> w
                        .like(FinPettyCash::getApplicant, keyword)
                        .or().like(FinPettyCash::getCashNo, keyword)
                        .or().like(FinPettyCash::getPurpose, keyword))
                .eq(StringUtils.hasText(status), FinPettyCash::getStatus, status)
                .orderByDesc(FinPettyCash::getCreateTime);
        return pettyCashMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long savePettyCash(FinPettyCash entity) {
        if (entity.getId() == null) {
            if (!StringUtils.hasText(entity.getCashNo())) {
                entity.setCashNo("PC" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(entity.getStatus())) {
                entity.setStatus("applied");
            }
            if (entity.getReturnedAmount() == null) {
                entity.setReturnedAmount(BigDecimal.ZERO);
            }
            pettyCashMapper.insert(entity);
        } else {
            pettyCashMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Override
    public void removePettyCash(Long id) {
        pettyCashMapper.deleteById(id);
    }

    @Override
    public void changeStatus(Long id, String status) {
        FinPettyCash entity = pettyCashMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException("备用金单据不存在");
        }
        entity.setStatus(status);
        pettyCashMapper.updateById(entity);
    }
}
