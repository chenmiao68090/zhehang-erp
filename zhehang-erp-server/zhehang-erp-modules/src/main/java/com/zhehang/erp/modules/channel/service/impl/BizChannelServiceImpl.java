package com.zhehang.erp.modules.channel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.channel.domain.BizAddressResource;
import com.zhehang.erp.modules.channel.domain.BizChannelCost;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import com.zhehang.erp.modules.channel.domain.BizSupplier;
import com.zhehang.erp.modules.channel.mapper.BizAddressResourceMapper;
import com.zhehang.erp.modules.channel.mapper.BizChannelCostMapper;
import com.zhehang.erp.modules.channel.mapper.BizProcurementMapper;
import com.zhehang.erp.modules.channel.mapper.BizSupplierMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizChannelServiceImpl implements IBizChannelService {

    private final BizSupplierMapper supplierMapper;
    private final BizAddressResourceMapper addressMapper;
    private final BizProcurementMapper procurementMapper;
    private final BizChannelCostMapper channelCostMapper;

    @Override
    public IPage<BizSupplier> supplierList(int pageNum, int pageSize, String name, String status) {
        LambdaQueryWrapper<BizSupplier> wrapper = new LambdaQueryWrapper<>();
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
        res.setStatus("available");
        res.setCustomerId(null);
        res.setContractId(null);
        res.setSoldDate(null);
        addressMapper.updateById(res);
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
        wrapper.eq(supplierId != null, BizProcurement::getSupplierId, supplierId)
                .eq(StringUtils.hasText(status), BizProcurement::getStatus, status)
                .orderByDesc(BizProcurement::getCreateTime);
        return procurementMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public Long saveProcurement(BizProcurement procurement) {
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

    @Override
    public void approveProcurement(Long id, boolean pass, Long approverId) {
        BizProcurement p = procurementMapper.selectById(id);
        if (p == null) {
            throw new BusinessException("采购单不存在");
        }
        if (!"pending_approval".equals(p.getStatus())) {
            throw new BusinessException("当前状态不可审批");
        }
        p.setStatus(pass ? "approved" : "rejected");
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
    public void stockInProcurement(Long id) {
        BizProcurement p = procurementMapper.selectById(id);
        if (p == null) {
            throw new BusinessException("采购单不存在");
        }
        if (!"paid".equals(p.getStatus())) {
            throw new BusinessException("当前状态不可入库");
        }
        p.setStatus("stocked");
        procurementMapper.updateById(p);
    }

    @Override
    public IPage<BizChannelCost> channelCostList(int pageNum, int pageSize, String channelType, String period) {
        LambdaQueryWrapper<BizChannelCost> wrapper = new LambdaQueryWrapper<>();
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
