package com.zhehang.erp.modules.supply.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseOrder;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseReq;
import com.zhehang.erp.modules.supply.mapper.SupplyPurchaseOrderMapper;
import com.zhehang.erp.modules.supply.mapper.SupplyPurchaseReqMapper;
import com.zhehang.erp.modules.supply.service.ISupplyPurchaseOrderService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SupplyPurchaseOrderServiceImpl extends ServiceImpl<SupplyPurchaseOrderMapper, SupplyPurchaseOrder> implements ISupplyPurchaseOrderService {

    private final SupplyPurchaseReqMapper reqMapper;
    private final DataScopeHelper dataScopeHelper;

    public IPage<SupplyPurchaseOrder> selectPage(int pageNum, int pageSize, String orderNo, Integer status, Long vendorId) {
        LambdaQueryWrapper<SupplyPurchaseOrder> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SupplyPurchaseOrder::getCreateBy); // 采购单(单价/金额)按创建人收敛
        if (StringUtils.hasText(orderNo)) {
            wrapper.like(SupplyPurchaseOrder::getOrderNo, orderNo);
        }
        if (status != null) {
            wrapper.eq(SupplyPurchaseOrder::getStatus, status);
        }
        if (vendorId != null) {
            wrapper.eq(SupplyPurchaseOrder::getVendorId, vendorId);
        }
        wrapper.orderByDesc(SupplyPurchaseOrder::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Transactional(rollbackFor = Exception.class)
    public void createFromReq(SupplyPurchaseOrder order) {
        order.setOrderNo(generateOrderNo());
        save(order);
        // 更新申请单状态为已生成订单
        if (order.getReqId() != null) {
            SupplyPurchaseReq req = new SupplyPurchaseReq();
            req.setId(order.getReqId());
            req.setStatus(4);
            reqMapper.updateById(req);
        }
    }

    public void confirm(Long id) {
        SupplyPurchaseOrder order = new SupplyPurchaseOrder();
        order.setId(id);
        order.setStatus(1);
        updateById(order);
    }

    public void markShipped(Long id) {
        SupplyPurchaseOrder order = new SupplyPurchaseOrder();
        order.setId(id);
        order.setStatus(3);
        updateById(order);
    }

    public void markArrived(Long id) {
        SupplyPurchaseOrder order = new SupplyPurchaseOrder();
        order.setId(id);
        order.setStatus(4);
        order.setActualDate(LocalDate.now());
        updateById(order);
    }

    public String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "PO" + dateStr + random;
    }
}
