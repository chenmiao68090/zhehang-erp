package com.zhehang.erp.modules.order.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.domain.BizOrderItem;

import java.util.List;
import java.util.Map;

public interface IBizOrderService extends IService<BizOrder> {

    /** 分页查询订单列表 */
    IPage<BizOrder> selectPage(int pageNum, int pageSize, Integer status, Long customerId, String orderNo);

    /** 订单详情(含子项) */
    Map<String, Object> getDetail(Long id);

    /** 创建订单(含子项) */
    Long createWithItems(BizOrder order, List<BizOrderItem> items);

    /** 更新订单(含子项) */
    void updateWithItems(BizOrder order, List<BizOrderItem> items);

    /** 提交审批 */
    void submit(Long id, Long operatorId);

    /** 主管审批通过 */
    void approve(Long id, Long approverId, String comment);

    /** 驳回 */
    void reject(Long id, Long approverId, String comment);

    /** 财务确认 */
    void financeConfirm(Long id, Long approverId, String comment);

    /** 取消订单 */
    void cancel(Long id, Long operatorId, String reason);

    /** 各状态统计 */
    Map<String, Object> stats();
}
