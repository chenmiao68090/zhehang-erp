package com.zhehang.erp.modules.contract.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.domain.BizContractTemplate;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.contract.mapper.BizContractTemplateMapper;
import com.zhehang.erp.modules.contract.service.IBizContractService;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BizContractServiceImpl extends ServiceImpl<BizContractMapper, BizContract> implements IBizContractService {

    private final BizContractMapper contractMapper;
    private final BizContractTemplateMapper templateMapper;
    private final BizOrderMapper orderMapper;

    @Override
    public IPage<BizContract> selectPage(int pageNum, int pageSize, String contractNo, Long customerId, Integer status) {
        LambdaQueryWrapper<BizContract> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(contractNo), BizContract::getContractNo, contractNo)
                .eq(customerId != null, BizContract::getCustomerId, customerId)
                .eq(status != null, BizContract::getStatus, status)
                .orderByDesc(BizContract::getCreateTime);
        return contractMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long generateFromOrder(Long orderId, Long templateId, String title) {
        BizOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        BizContract contract = new BizContract();
        contract.setContractNo("CT" + System.currentTimeMillis());
        contract.setTitle(StringUtils.hasText(title) ? title : ("订单合同 - " + order.getOrderNo()));
        contract.setOrderId(orderId);
        contract.setCustomerId(order.getCustomerId());
        contract.setCustomerName(order.getCustomerName());
        contract.setTemplateId(templateId);
        contract.setContractType("new");
        contract.setAmount(order.getPayableAmount() != null ? order.getPayableAmount() : order.getTotalAmount());
        contract.setStartDate(order.getServiceStartDate());
        contract.setEndDate(order.getServiceEndDate());
        contract.setStatus(1);
        if (templateId != null) {
            BizContractTemplate template = templateMapper.selectById(templateId);
            if (template != null) {
                contract.setContent(template.getContent());
            }
        }
        contractMapper.insert(contract);
        return contract.getId();
    }

    @Override
    public void sendSign(Long id, String signMode) {
        BizContract contract = contractMapper.selectById(id);
        if (contract == null) {
            throw new BusinessException("合同不存在");
        }
        if (contract.getStatus() != null && contract.getStatus() >= 4) {
            throw new BusinessException("合同已签署,不能重复发送");
        }
        contract.setStatus(3);
        contract.setSignMode(StringUtils.hasText(signMode) ? signMode : "online");
        contract.setSendSignTime(LocalDateTime.now());
        contractMapper.updateById(contract);
    }

    @Override
    public void confirmSign(Long id, String signerTheirs) {
        BizContract contract = contractMapper.selectById(id);
        if (contract == null) {
            throw new BusinessException("合同不存在");
        }
        contract.setStatus(4);
        contract.setSignerTheirs(signerTheirs);
        contract.setSignDate(LocalDate.now());
        contract.setConfirmSignTime(LocalDateTime.now());
        contractMapper.updateById(contract);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long renew(Long id, String newTitle) {
        BizContract origin = contractMapper.selectById(id);
        if (origin == null) {
            throw new BusinessException("原合同不存在");
        }
        BizContract renew = new BizContract();
        renew.setContractNo("CT" + System.currentTimeMillis());
        renew.setTitle(StringUtils.hasText(newTitle) ? newTitle : ("续签 - " + origin.getTitle()));
        renew.setOrderId(origin.getOrderId());
        renew.setCustomerId(origin.getCustomerId());
        renew.setCustomerName(origin.getCustomerName());
        renew.setTemplateId(origin.getTemplateId());
        renew.setContractType("renew");
        renew.setParentId(origin.getId());
        renew.setAmount(origin.getAmount());
        renew.setStartDate(origin.getEndDate() != null ? origin.getEndDate().plusDays(1) : LocalDate.now());
        renew.setEndDate(renew.getStartDate() != null ? renew.getStartDate().plusYears(1) : null);
        renew.setStatus(1);
        renew.setContent(origin.getContent());
        contractMapper.insert(renew);
        return renew.getId();
    }

    @Override
    public void terminate(Long id, String reason) {
        BizContract contract = contractMapper.selectById(id);
        if (contract == null) {
            throw new BusinessException("合同不存在");
        }
        contract.setStatus(7);
        contract.setTerminateTime(LocalDateTime.now());
        contract.setTerminateReason(reason);
        contractMapper.updateById(contract);
    }

    @Override
    public List<BizContract> getExpiring(int days) {
        LocalDate today = LocalDate.now();
        LocalDate threshold = today.plusDays(days <= 0 ? 30 : days);
        LambdaQueryWrapper<BizContract> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(BizContract::getEndDate, today, threshold)
                .in(BizContract::getStatus, 4, 5)
                .orderByAsc(BizContract::getEndDate);
        return contractMapper.selectList(wrapper);
    }

    @Override
    public List<BizContractTemplate> listTemplates(String category, Integer status) {
        LambdaQueryWrapper<BizContractTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(category), BizContractTemplate::getCategory, category)
                .eq(status != null, BizContractTemplate::getStatus, status)
                .orderByDesc(BizContractTemplate::getCreateTime);
        return templateMapper.selectList(wrapper);
    }

    @Override
    public Long saveTemplate(BizContractTemplate template) {
        if (template.getId() == null) {
            if (template.getStatus() == null) {
                template.setStatus(1);
            }
            templateMapper.insert(template);
        } else {
            templateMapper.updateById(template);
        }
        return template.getId();
    }
}
