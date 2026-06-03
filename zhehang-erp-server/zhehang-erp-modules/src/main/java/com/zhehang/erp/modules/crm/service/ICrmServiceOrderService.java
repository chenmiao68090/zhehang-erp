package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmServiceOrder;

import java.util.List;

public interface ICrmServiceOrderService extends IService<CrmServiceOrder> {
    IPage<CrmServiceOrder> selectPage(int pageNum, int pageSize, Long customerId, String serviceType, Integer status);

    /** 获取即将到期的服务订单 */
    List<CrmServiceOrder> getExpiringOrders(int days);

    /** 触发续费提醒 */
    int triggerRenewalReminder();
}
