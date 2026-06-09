package com.zhehang.erp.modules.sales.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.sales.domain.entity.SalesDelivery;
import com.zhehang.erp.modules.sales.mapper.SalesDeliveryMapper;
import com.zhehang.erp.modules.sales.service.ISalesDeliveryService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class SalesDeliveryServiceImpl extends ServiceImpl<SalesDeliveryMapper, SalesDelivery> implements ISalesDeliveryService {

    private final SalesDeliveryMapper deliveryMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<SalesDelivery> selectPage(int pageNum, int pageSize, String deliveryNo, String orderNo, Long customerId) {
        LambdaQueryWrapper<SalesDelivery> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:发货/交付单按创建人收敛;管理员/财务部(data_scope=1)看全部
        dataScopeHelper.applyCreatorScope(wrapper, SalesDelivery::getCreateBy);
        wrapper.like(StringUtils.hasText(deliveryNo), SalesDelivery::getDeliveryNo, deliveryNo)
               .like(StringUtils.hasText(orderNo), SalesDelivery::getOrderNo, orderNo)
               .eq(customerId != null, SalesDelivery::getCustomerId, customerId)
               .orderByDesc(SalesDelivery::getCreateTime);
        return deliveryMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(SalesDelivery entity) {
        if (!StringUtils.hasText(entity.getDeliveryNo())) {
            entity.setDeliveryNo("DL" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                    + String.format("%04d", (int)(Math.random() * 10000)));
        }
        if (entity.getStatus() == null) {
            entity.setStatus(0);
        }
        return super.save(entity);
    }
}
