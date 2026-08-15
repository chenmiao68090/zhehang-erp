package com.zhehang.erp.modules.supply.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.supply.domain.entity.SupplyReturn;
import com.zhehang.erp.modules.supply.mapper.SupplyReturnMapper;
import com.zhehang.erp.modules.supply.service.ISupplyReturnService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class SupplyReturnServiceImpl extends ServiceImpl<SupplyReturnMapper, SupplyReturn> implements ISupplyReturnService {

    private final DataScopeHelper dataScopeHelper;

    public IPage<SupplyReturn> selectPage(int pageNum, int pageSize, String returnNo, Integer status) {
        LambdaQueryWrapper<SupplyReturn> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, SupplyReturn::getCreateBy); // 退货单按创建人收敛
        if (StringUtils.hasText(returnNo)) {
            wrapper.like(SupplyReturn::getReturnNo, returnNo);
        }
        if (status != null) {
            wrapper.eq(SupplyReturn::getStatus, status);
        }
        wrapper.orderByDesc(SupplyReturn::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public void process(Long id) {
        SupplyReturn ret = new SupplyReturn();
        ret.setId(id);
        ret.setStatus(1);
        updateById(ret);
    }

    public void complete(Long id) {
        SupplyReturn ret = new SupplyReturn();
        ret.setId(id);
        ret.setStatus(2);
        updateById(ret);
    }

    public String generateReturnNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "RT" + dateStr + random;
    }
}
