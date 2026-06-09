package com.zhehang.erp.modules.supply.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseReq;
import com.zhehang.erp.modules.supply.mapper.SupplyPurchaseReqMapper;
import com.zhehang.erp.modules.supply.service.ISupplyPurchaseReqService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SupplyPurchaseReqServiceImpl extends ServiceImpl<SupplyPurchaseReqMapper, SupplyPurchaseReq> implements ISupplyPurchaseReqService {

    private final DataScopeHelper dataScopeHelper;

    public IPage<SupplyPurchaseReq> selectPage(int pageNum, int pageSize, String reqNo, Integer status) {
        LambdaQueryWrapper<SupplyPurchaseReq> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SupplyPurchaseReq::getCreateBy); // 请购单按创建人收敛
        if (StringUtils.hasText(reqNo)) {
            wrapper.like(SupplyPurchaseReq::getReqNo, reqNo);
        }
        if (status != null) {
            wrapper.eq(SupplyPurchaseReq::getStatus, status);
        }
        wrapper.orderByDesc(SupplyPurchaseReq::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void submit(Long id) {
        SupplyPurchaseReq req = new SupplyPurchaseReq();
        req.setId(id);
        req.setStatus(1);
        updateById(req);
    }

    public void approve(Long id) {
        SupplyPurchaseReq req = new SupplyPurchaseReq();
        req.setId(id);
        req.setStatus(2);
        updateById(req);
    }

    public void reject(Long id) {
        SupplyPurchaseReq req = new SupplyPurchaseReq();
        req.setId(id);
        req.setStatus(3);
        updateById(req);
    }

    public String generateReqNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "PR" + dateStr + random;
    }
}
