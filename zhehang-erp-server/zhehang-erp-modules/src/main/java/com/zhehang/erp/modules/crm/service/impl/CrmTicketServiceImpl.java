package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.crm.domain.entity.CrmTicket;
import com.zhehang.erp.modules.crm.mapper.CrmTicketMapper;
import com.zhehang.erp.modules.crm.service.ICrmTicketService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrmTicketServiceImpl extends ServiceImpl<CrmTicketMapper, CrmTicket> implements ICrmTicketService {

    private final CrmTicketMapper ticketMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<CrmTicket> selectPage(int pageNum, int pageSize, Long customerId, Integer priority, Integer status) {
        LambdaQueryWrapper<CrmTicket> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:工单按创建人收敛;管理员/data_scope=1看全部
        dataScopeHelper.applyCreatorScope(wrapper, CrmTicket::getCreateBy);
        wrapper.eq(customerId != null, CrmTicket::getCustomerId, customerId)
               .eq(priority != null, CrmTicket::getPriority, priority)
               .eq(status != null, CrmTicket::getStatus, status)
               .orderByDesc(CrmTicket::getCreateTime);
        return ticketMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }
}
