package com.zhehang.erp.modules.supply.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.supply.domain.entity.SupplyVendor;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseOrder;
import com.zhehang.erp.modules.supply.mapper.SupplyVendorMapper;
import com.zhehang.erp.modules.supply.mapper.SupplyPurchaseOrderMapper;
import com.zhehang.erp.modules.supply.service.ISupplyVendorService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SupplyVendorServiceImpl extends ServiceImpl<SupplyVendorMapper, SupplyVendor> implements ISupplyVendorService {

    private final SupplyPurchaseOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;

    public IPage<SupplyVendor> selectPage(int pageNum, int pageSize, String name, Integer rating, Integer status) {
        LambdaQueryWrapper<SupplyVendor> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SupplyVendor::getCreateBy); // 供应商(银行账号)按创建人收敛
        if (StringUtils.hasText(name)) {
            wrapper.like(SupplyVendor::getName, name);
        }
        if (rating != null) {
            wrapper.eq(SupplyVendor::getRating, rating);
        }
        if (status != null) {
            wrapper.eq(SupplyVendor::getStatus, status);
        }
        wrapper.orderByDesc(SupplyVendor::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public Map<String, Object> getDetail(Long id) {
        Map<String, Object> result = new HashMap<>();
        SupplyVendor vendor = getById(id);
        result.put("vendor", vendor);
        // 查询该供应商的采购历史
        LambdaQueryWrapper<SupplyPurchaseOrder> orderWrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(orderWrapper, SupplyPurchaseOrder::getCreateBy); // 关联采购单按创建人收敛,防越权查看他人采购历史
        orderWrapper.eq(SupplyPurchaseOrder::getVendorId, id).orderByDesc(SupplyPurchaseOrder::getCreateTime);
        List<SupplyPurchaseOrder> orders = orderMapper.selectList(orderWrapper);
        result.put("orders", orders);
        return result;
    }

    public void updateRating(Long id, Integer rating) {
        SupplyVendor vendor = new SupplyVendor();
        vendor.setId(id);
        vendor.setRating(rating);
        updateById(vendor);
    }
}
