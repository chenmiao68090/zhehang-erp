package com.zhehang.erp.modules.supply.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.supply.domain.entity.SupplyReceipt;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseOrder;
import com.zhehang.erp.modules.supply.mapper.SupplyReceiptMapper;
import com.zhehang.erp.modules.supply.mapper.SupplyPurchaseOrderMapper;
import com.zhehang.erp.modules.supply.service.ISupplyReceiptService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SupplyReceiptServiceImpl extends ServiceImpl<SupplyReceiptMapper, SupplyReceipt> implements ISupplyReceiptService {

    private final SupplyPurchaseOrderMapper orderMapper;
    private final DataScopeHelper dataScopeHelper;

    public IPage<SupplyReceipt> selectPage(int pageNum, int pageSize, String receiptNo, Integer status) {
        LambdaQueryWrapper<SupplyReceipt> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SupplyReceipt::getCreateBy); // 到货单按创建人收敛
        if (StringUtils.hasText(receiptNo)) {
            wrapper.like(SupplyReceipt::getReceiptNo, receiptNo);
        }
        if (status != null) {
            wrapper.eq(SupplyReceipt::getStatus, status);
        }
        wrapper.orderByDesc(SupplyReceipt::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void inspect(Long id, Integer result) {
        SupplyReceipt receipt = getById(id);
        receipt.setStatus(result);
        updateById(receipt);
        // 验收通过后更新订单状态为已验收
        if (result == 1 && receipt.getOrderId() != null) {
            SupplyPurchaseOrder order = new SupplyPurchaseOrder();
            order.setId(receipt.getOrderId());
            order.setStatus(5);
            orderMapper.updateById(order);
        }
    }

    public String generateReceiptNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "RN" + dateStr + random;
    }
}
