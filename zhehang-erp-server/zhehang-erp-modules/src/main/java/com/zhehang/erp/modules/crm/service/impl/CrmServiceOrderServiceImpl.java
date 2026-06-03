package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.crm.domain.entity.CrmReminder;
import com.zhehang.erp.modules.crm.domain.entity.CrmServiceOrder;
import com.zhehang.erp.modules.crm.mapper.CrmReminderMapper;
import com.zhehang.erp.modules.crm.mapper.CrmServiceOrderMapper;
import com.zhehang.erp.modules.crm.service.ICrmServiceOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmServiceOrderServiceImpl extends ServiceImpl<CrmServiceOrderMapper, CrmServiceOrder> implements ICrmServiceOrderService {

    private final CrmServiceOrderMapper serviceOrderMapper;
    private final CrmReminderMapper reminderMapper;

    @Override
    public IPage<CrmServiceOrder> selectPage(int pageNum, int pageSize, Long customerId, String serviceType, Integer status) {
        LambdaQueryWrapper<CrmServiceOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(customerId != null, CrmServiceOrder::getCustomerId, customerId)
               .eq(serviceType != null && !serviceType.isEmpty(), CrmServiceOrder::getServiceType, serviceType)
               .eq(status != null, CrmServiceOrder::getStatus, status)
               .orderByDesc(CrmServiceOrder::getCreateTime);
        return serviceOrderMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<CrmServiceOrder> getExpiringOrders(int days) {
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(days);
        LambdaQueryWrapper<CrmServiceOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(CrmServiceOrder::getEndDate, today, threshold)
               .ne(CrmServiceOrder::getRenewalStatus, "renewed")
               .orderByAsc(CrmServiceOrder::getEndDate);
        return serviceOrderMapper.selectList(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int triggerRenewalReminder() {
        List<CrmServiceOrder> expiring = getExpiringOrders(30);
        int count = 0;
        for (CrmServiceOrder order : expiring) {
            CrmReminder reminder = new CrmReminder();
            reminder.setTargetId(order.getId());
            reminder.setTargetType("service_order");
            reminder.setReminderType("renewal");
            reminder.setReminderLevel("warning");
            reminder.setTitle("服务即将到期: " + order.getCustomerName());
            reminder.setContent("合同号 " + order.getContractNo() + " 将于 " + order.getEndDate() + " 到期, 请及时跟进续费");
            reminder.setRecipientId(order.getHandlerId());
            reminder.setRecipientName(order.getHandlerName());
            reminder.setSentTime(LocalDateTime.now());
            reminder.setStatus(0);
            reminderMapper.insert(reminder);
            count++;
        }
        log.info("续费提醒触发完成, 数量: {}", count);
        return count;
    }
}
