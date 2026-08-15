package com.zhehang.erp.modules.channel.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.channel.domain.BizAddressResource;
import com.zhehang.erp.modules.channel.domain.BizChannelCost;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.domain.BizSupplier;

import java.util.List;
import java.util.Map;

public interface IBizChannelService {

    /** 供应商分页 */
    IPage<BizSupplier> supplierList(int pageNum, int pageSize, String name, String status);

    /** 保存供应商 */
    Long saveSupplier(BizSupplier supplier);

    /** 删除供应商 */
    void removeSupplier(Long id);

    /** 地址列表 */
    IPage<BizAddressResource> addressList(int pageNum, int pageSize, String status, String region);

    /** 可用地址列表 */
    List<BizAddressResource> availableAddresses(String region);

    /** 预留地址 */
    void reserveAddress(Long id, Long customerId, Long orderId);

    /** 售出地址 */
    void sellAddress(Long id, Long customerId, Long orderId);

    /** 释放地址 */
    void releaseAddress(Long id);

    /** 保存地址资源 */
    Long saveAddress(BizAddressResource address);

    /** 采购单分页 */
    IPage<BizProcurement> procurementList(int pageNum, int pageSize, Long supplierId, String status);

    /** 保存采购单 */
    Long saveProcurement(BizProcurement procurement);

    /** 审批采购单 */
    void approveProcurement(Long id, boolean pass, Long approverId);

    /** 付款采购单 */
    void payProcurement(Long id);

    /** 入库：同一事务内生成地址资源，返回新增资源 ID。 */
    List<Long> stockInProcurement(Long id);

    /** 渠道成本列表 */
    IPage<BizChannelCost> channelCostList(int pageNum, int pageSize, String channelType, String period);

    /** 保存渠道成本 */
    Long saveChannelCost(BizChannelCost cost);

    /** ROI 分析 */
    Map<String, Object> roiAnalysis(String period);
}
