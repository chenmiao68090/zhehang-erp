package com.zhehang.erp.modules.channel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.channel.domain.BizAddressResource;
import com.zhehang.erp.modules.channel.domain.BizChannelCost;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.domain.BizSupplier;
import com.zhehang.erp.modules.channel.mapper.BizAddressResourceMapper;
import com.zhehang.erp.modules.channel.mapper.BizChannelCostMapper;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.channel.mapper.BizSupplierMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizChannelServiceImpl implements IBizChannelService {

    private final BizSupplierMapper supplierMapper;
    private final BizAddressResourceMapper addressMapper;
    private final BizProcurementMapper procurementMapper;
    private final BizChannelCostMapper channelCostMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<BizSupplier> supplierList(int pageNum, int pageSize, String name, String status) {
        LambdaQueryWrapper<BizSupplier> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, BizSupplier::getCreateBy); // 供应商(银行账号等)按创建人收敛
        wrapper.like(StringUtils.hasText(name), BizSupplier::getName, name)
                .eq(StringUtils.hasText(status), BizSupplier::getStatus, status)
                .orderByDesc(BizSupplier::getCreateTime);
        return supplierMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveSupplier(BizSupplier supplier) {
        if (supplier.getId() == null) {
            if (!StringUtils.hasText(supplier.getSupplierNo())) {
                supplier.setSupplierNo("SUP" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(supplier.getStatus())) {
                supplier.setStatus("active");
            }
            supplierMapper.insert(supplier);
        } else {
            supplierMapper.updateById(supplier);
        }
        return supplier.getId();
    }

    @Override
    public void removeSupplier(Long id) {
        supplierMapper.deleteById(id);
    }

    @Override
    public IPage<BizAddressResource> addressList(int pageNum, int pageSize, String status, String region) {
        LambdaQueryWrapper<BizAddressResource> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, BizAddressResource::getCreateBy); // 地址资源(进价/利润)按创建人收敛(availableAddresses共享不收敛)
        wrapper.eq(StringUtils.hasText(status), BizAddressResource::getStatus, status)
                .like(StringUtils.hasText(region), BizAddressResource::getRegion, region)
                .orderByDesc(BizAddressResource::getCreateTime);
        return addressMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public List<BizAddressResource> availableAddresses(String region) {
        LambdaQueryWrapper<BizAddressResource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(BizAddressResource::getStatus, "available")
                .like(StringUtils.hasText(region), BizAddressResource::getRegion, region)
                .orderByAsc(BizAddressResource::getPurchasePrice);
        return addressMapper.selectList(wrapper);
    }

    @Override
    public void reserveAddress(Long id, Long customerId, Long orderId) {
        BizAddressResource res = addressMapper.selectById(id);
        if (res == null) {
            throw new BusinessException("地址资源不存在");
        }
        if (!"available".equals(res.getStatus())) {
            throw new BusinessException("当前地址不可预留");
        }
        res.setStatus("reserved");
        res.setCustomerId(customerId);
        res.setContractId(orderId);
        addressMapper.updateById(res);
    }

    @Override
    public void sellAddress(Long id, Long customerId, Long orderId) {
        BizAddressResource res = addressMapper.selectById(id);
        if (res == null) {
            throw new BusinessException("地址资源不存在");
        }
        if ("sold".equals(res.getStatus())) {
            throw new BusinessException("地址已售出");
        }
        res.setStatus("sold");
        if (customerId != null) {
            res.setCustomerId(customerId);
        }
        if (orderId != null) {
            res.setContractId(orderId);
        }
        res.setSoldDate(LocalDate.now());
        addressMapper.updateById(res);
    }

    @Override
    public void releaseAddress(Long id) {
        BizAddressResource res = addressMapper.selectById(id);
        if (res == null) {
            throw new BusinessException("地址资源不存在");
        }
        // MyBatis-Plus updateById 默认跳过 null 字段,清空客户绑定必须用 LambdaUpdateWrapper.set(...,null),
        // 否则释放后地址仍挂着旧客户/合同,会被重复分配。
        addressMapper.update(null, new LambdaUpdateWrapper<BizAddressResource>()
                .eq(BizAddressResource::getId, id)
                .set(BizAddressResource::getStatus, "available")
                .set(BizAddressResource::getCustomerId, null)
                .set(BizAddressResource::getContractId, null)
                .set(BizAddressResource::getSoldDate, null));
    }

    @Override
    public Long saveAddress(BizAddressResource address) {
        if (address.getId() == null) {
            if (!StringUtils.hasText(address.getResourceNo())) {
                address.setResourceNo("ADR" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(address.getStatus())) {
                address.setStatus("available");
            }
            addressMapper.insert(address);
        } else {
            addressMapper.updateById(address);
        }
        return address.getId();
    }

    @Override
    public IPage<BizProcurement> procurementList(int pageNum, int pageSize, Long supplierId, String status) {
        LambdaQueryWrapper<BizProcurement> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, BizProcurement::getCreateBy); // 采购单(单价/实付)按创建人收敛
        wrapper.eq(supplierId != null, BizProcurement::getSupplierId, supplierId)
                .eq(StringUtils.hasText(status), BizProcurement::getStatus, status)
                .orderByDesc(BizProcurement::getCreateTime);
        return procurementMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveProcurement(BizProcurement procurement) {
        if (procurement.getSupplierId() == null || supplierMapper.selectById(procurement.getSupplierId()) == null) {
            throw new BusinessException("请选择有效的地址供应商");
        }
        List<String> addressLines = procurementAddressLines(procurement);
        if (addressLines.isEmpty()) {
            throw new BusinessException("请填写地址资源明细,一行一个地址");
        }
        if (procurement.getQuantity() == null || procurement.getQuantity() <= 0) {
            throw new BusinessException("采购数量必须大于0");
        }
        if (procurement.getQuantity() != addressLines.size()) {
            throw new BusinessException("地址资源明细数量与采购数量不一致");
        }
        if (procurement.getId() == null) {
            if (!StringUtils.hasText(procurement.getProcurementNo())) {
                procurement.setProcurementNo("PRC" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(procurement.getStatus())) {
                procurement.setStatus("pending_approval");
            }
            procurementMapper.insert(procurement);
        } else {
            procurementMapper.updateById(procurement);
        }
        return procurement.getId();
    }

    /** 采购二级审批金额阈值:>3000 主管通过后必须老板再批(与 wf purchase 流程的金额条件同口径) */
    private static final java.math.BigDecimal PROCUREMENT_BOSS_THRESHOLD = new java.math.BigDecimal("3000");

    @Override
    public void approveProcurement(Long id, boolean pass, Long approverId) {
        BizProcurement p = procurementMapper.selectById(id);
        if (p == null) {
            throw new BusinessException("采购单不存在");
        }
        boolean bossStage = "pending_boss".equals(p.getStatus());
        if (!"pending_approval".equals(p.getStatus()) && !bossStage) {
            throw new BusinessException("当前状态不可审批");
        }
        if (bossStage) {
            // 老板终审:金额>3000 的第二级,只有 boss/超管能批(服务端判角色,不信前端 level 参数)
            if (!com.zhehang.erp.common.core.utils.SecurityUtils.isCurrentAdmin()
                    && !com.zhehang.erp.common.core.utils.SecurityUtils.hasAnyRole("boss")) {
                throw new BusinessException("金额超过3000元,需老板/超级管理员终审");
            }
            p.setStatus(pass ? "approved" : "rejected");
        } else if (pass && p.getTotalAmount() != null
                && p.getTotalAmount().compareTo(PROCUREMENT_BOSS_THRESHOLD) > 0) {
            // 主管通过但金额>3000:进入老板终审,不能一步到 approved("转老板"由服务端强制,前端伪造 level 无效)
            p.setStatus("pending_boss");
        } else {
            p.setStatus(pass ? "approved" : "rejected");
        }
        p.setApproverId(approverId);
        p.setApprovalTime(LocalDateTime.now());
        procurementMapper.updateById(p);
    }

    @Override
    public void payProcurement(Long id) {
        BizProcurement p = procurementMapper.selectById(id);
        if (p == null) {
            throw new BusinessException("采购单不存在");
        }
        if (!"approved".equals(p.getStatus())) {
            throw new BusinessException("当前状态不可付款");
        }
        p.setStatus("paid");
        p.setPaymentStatus("paid");
        p.setPaymentDate(LocalDate.now());
        procurementMapper.updateById(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<Long> stockInProcurement(Long id) {
        // 同一采购单的并发入库必须先串行；后到请求会在首个事务提交后读到 stocked 并复用已有资源。
        BizProcurement p = procurementMapper.selectForUpdate(id, SecurityUtils.getCurrentTenantId());
        if (p == null) {
            throw new BusinessException("采购单不存在");
        }
        List<BizAddressResource> existing = addressMapper.selectList(new LambdaQueryWrapper<BizAddressResource>()
                .eq(BizAddressResource::getProcurementId, id)
                .orderByAsc(BizAddressResource::getId));
        if ("stocked".equals(p.getStatus())) {
            return existing.stream().map(BizAddressResource::getId).toList();
        }
        if (!"paid".equals(p.getStatus())) {
            throw new BusinessException("当前状态不可入库");
        }
        if (!existing.isEmpty()) {
            throw new BusinessException("该采购单已存在地址资源,请先核对后再入库");
        }
        List<String> lines = procurementAddressLines(p);
        if (lines.isEmpty()) {
            throw new BusinessException("请先填写地址资源明细,不能空单入库");
        }
        if (p.getQuantity() != null && p.getQuantity() > 0 && p.getQuantity() != lines.size()) {
            throw new BusinessException("地址资源明细数量与采购数量不一致");
        }

        List<Long> resourceIds = new ArrayList<>(lines.size());
        for (int i = 0; i < lines.size(); i++) {
            BizAddressResource resource = new BizAddressResource();
            resource.setResourceNo("ADR" + id + "-" + String.format("%03d", i + 1));
            resource.setSupplierId(p.getSupplierId());
            resource.setProcurementId(id);
            resource.setAddress(lines.get(i));
            resource.setRegion(extractRegion(lines.get(i)));
            resource.setPurchasePrice(p.getUnitPrice());
            resource.setStatus("available");
            resource.setStockInDate(LocalDate.now());
            addressMapper.insert(resource);
            resourceIds.add(resource.getId());
        }
        p.setStatus("stocked");
        procurementMapper.updateById(p);
        return resourceIds;
    }

    private List<String> procurementAddressLines(BizProcurement procurement) {
        return StringUtils.hasText(procurement.getAddressDetail())
                ? procurement.getAddressDetail().lines().map(String::trim).filter(StringUtils::hasText).toList()
                : List.of();
    }

    private static String extractRegion(String address) {
        if (!StringUtils.hasText(address)) {
            return "";
        }
        Matcher district = Pattern.compile("([\\p{IsHan}]{2,6}(?:区|县))").matcher(address);
        if (district.find()) {
            return district.group(1);
        }
        Matcher city = Pattern.compile("([\\p{IsHan}]{2,6}市)").matcher(address);
        return city.find() ? city.group(1) : "";
    }

    @Override
    public IPage<BizChannelCost> channelCostList(int pageNum, int pageSize, String channelType, String period) {
        LambdaQueryWrapper<BizChannelCost> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, BizChannelCost::getCreateBy); // 渠道投放成本按创建人收敛
        wrapper.eq(StringUtils.hasText(channelType), BizChannelCost::getChannelType, channelType)
                .eq(StringUtils.hasText(period), BizChannelCost::getPeriod, period)
                .orderByDesc(BizChannelCost::getCreateTime);
        return channelCostMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveChannelCost(BizChannelCost cost) {
        if (cost.getRevenue() != null && cost.getCostAmount() != null
                && cost.getCostAmount().compareTo(BigDecimal.ZERO) > 0) {
            cost.setRoi(cost.getRevenue().multiply(new BigDecimal("100"))
                    .divide(cost.getCostAmount(), 2, RoundingMode.HALF_UP));
        }
        if (cost.getId() == null) {
            channelCostMapper.insert(cost);
        } else {
            channelCostMapper.updateById(cost);
        }
        return cost.getId();
    }

    @Override
    public Map<String, Object> roiAnalysis(String period) {
        LambdaQueryWrapper<BizChannelCost> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.applyCreatorScope(wrapper, BizChannelCost::getCreateBy); // ROI 分析也按创建人收敛(与 channelCostList 一致)
        wrapper.eq(StringUtils.hasText(period), BizChannelCost::getPeriod, period)
                .orderByDesc(BizChannelCost::getRoi);
        List<BizChannelCost> list = channelCostMapper.selectList(wrapper);
        BigDecimal totalCost = list.stream()
                .map(c -> c.getCostAmount() == null ? BigDecimal.ZERO : c.getCostAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRevenue = list.stream()
                .map(c -> c.getRevenue() == null ? BigDecimal.ZERO : c.getRevenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalRoi = totalCost.compareTo(BigDecimal.ZERO) > 0
                ? totalRevenue.multiply(new BigDecimal("100"))
                .divide(totalCost, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        Map<String, Object> result = new HashMap<>();
        result.put("period", period);
        result.put("items", list);
        result.put("totalCost", totalCost);
        result.put("totalRevenue", totalRevenue);
        result.put("totalRoi", totalRoi);
        return result;
    }
}
