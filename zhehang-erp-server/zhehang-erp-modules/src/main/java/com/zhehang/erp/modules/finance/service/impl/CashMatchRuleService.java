package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleEvent;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchRuleConfigMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchRuleEventMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/** 管理每租户唯一一份核销推荐规则，并保留完整变更快照。 */
@Service
@RequiredArgsConstructor
public class CashMatchRuleService {
    private final FinCashMatchRuleConfigMapper configMapper;
    private final FinCashMatchRuleEventMapper eventMapper;
    private final SysUserMapper sysUserMapper;
    private final ObjectMapper objectMapper;

    public FinCashMatchRuleConfig current() {
        FinCashMatchRuleConfig config = configMapper.selectOne(new LambdaQueryWrapper<FinCashMatchRuleConfig>()
                .last("LIMIT 1"));
        return config == null ? defaults() : config;
    }

    public FinCashMatchRuleConfig managementView() {
        assertManager();
        return current();
    }

    public List<FinCashMatchRuleEvent> events() {
        assertManager();
        return eventMapper.selectList(new LambdaQueryWrapper<FinCashMatchRuleEvent>()
                .orderByDesc(FinCashMatchRuleEvent::getActionTime)
                .orderByDesc(FinCashMatchRuleEvent::getId)
                .last("LIMIT 100"));
    }

    /** 试算配置与已保存配置使用同一校验规则，但不写数据库。 */
    public FinCashMatchRuleConfig draft(CashMatchRuleRequest request) {
        assertManager();
        FinCashMatchRuleConfig draft = copy(current());
        apply(draft, request);
        validate(draft);
        return draft;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashMatchRuleConfig save(CashMatchRuleRequest request) {
        assertManager();
        String reason = request == null ? null : trim(request.getReason());
        if (!StringUtils.hasText(reason)) {
            throw new BusinessException("修改推荐规则必须填写原因");
        }
        if (reason.length() > 500) {
            throw new BusinessException("推荐规则修改原因不能超过500字");
        }

        FinCashMatchRuleConfig before = configMapper.selectOne(new LambdaQueryWrapper<FinCashMatchRuleConfig>()
                .last("LIMIT 1"));
        FinCashMatchRuleConfig entity;
        String action;
        if (before == null) {
            entity = defaults();
            apply(entity, request);
            validate(entity);
            entity.setUpdateReason(reason);
            entity.setActivatedBy(SecurityUtils.getCurrentUserId());
            entity.setActivatedAt(LocalDateTime.now());
            entity.setVersion(0);
            try {
                configMapper.insert(entity);
            } catch (DuplicateKeyException e) {
                throw new BusinessException("推荐规则已被其他人建立，请刷新后重试");
            }
            action = "create";
        } else {
            if (request.getVersion() == null || !Objects.equals(request.getVersion(), before.getVersion())) {
                throw new BusinessException("推荐规则已被其他人更新，请刷新后重试");
            }
            entity = copy(before);
            apply(entity, request);
            validate(entity);
            entity.setUpdateReason(reason);
            entity.setActivatedBy(SecurityUtils.getCurrentUserId());
            entity.setActivatedAt(LocalDateTime.now());
            if (configMapper.updateById(entity) != 1) {
                throw new BusinessException("推荐规则已被其他人更新，请刷新后重试");
            }
            action = "update";
        }

        FinCashMatchRuleEvent event = new FinCashMatchRuleEvent();
        event.setConfigId(entity.getId());
        event.setActionType(action);
        event.setBeforeJson(before == null ? null : json(before));
        event.setAfterJson(json(entity));
        event.setReason(reason);
        event.setOperatorId(SecurityUtils.getCurrentUserId());
        event.setOperatorName(currentUserName());
        event.setActionTime(LocalDateTime.now());
        eventMapper.insert(event);
        return entity;
    }

    public static FinCashMatchRuleConfig defaults() {
        FinCashMatchRuleConfig config = new FinCashMatchRuleConfig();
        config.setConfigName("默认推荐规则");
        config.setCustomerExactWeight(50);
        config.setCustomerConflictPenalty(40);
        config.setOrderNoWeight(40);
        config.setPayerAliasWeight(30);
        config.setPayerSimilarWeight(20);
        config.setAmountExactWeight(15);
        config.setAmountNearWeight(8);
        config.setSalesWeight(5);
        config.setDateWeight(3);
        config.setAmountToleranceRate(new BigDecimal("0.0100"));
        config.setAmountToleranceFloor(new BigDecimal("1.00"));
        config.setDateWindowDays(30);
        config.setHighThreshold(80);
        config.setMediumThreshold(60);
        config.setMaxCandidates(200);
        config.setVersion(0);
        return config;
    }

    private void apply(FinCashMatchRuleConfig target, CashMatchRuleRequest request) {
        if (request == null) {
            return;
        }
        if (request.getConfigName() != null) target.setConfigName(trim(request.getConfigName()));
        if (request.getCustomerExactWeight() != null) target.setCustomerExactWeight(request.getCustomerExactWeight());
        if (request.getCustomerConflictPenalty() != null) target.setCustomerConflictPenalty(request.getCustomerConflictPenalty());
        if (request.getOrderNoWeight() != null) target.setOrderNoWeight(request.getOrderNoWeight());
        if (request.getPayerAliasWeight() != null) target.setPayerAliasWeight(request.getPayerAliasWeight());
        if (request.getPayerSimilarWeight() != null) target.setPayerSimilarWeight(request.getPayerSimilarWeight());
        if (request.getAmountExactWeight() != null) target.setAmountExactWeight(request.getAmountExactWeight());
        if (request.getAmountNearWeight() != null) target.setAmountNearWeight(request.getAmountNearWeight());
        if (request.getSalesWeight() != null) target.setSalesWeight(request.getSalesWeight());
        if (request.getDateWeight() != null) target.setDateWeight(request.getDateWeight());
        if (request.getAmountToleranceRate() != null) {
            target.setAmountToleranceRate(request.getAmountToleranceRate().setScale(4, RoundingMode.HALF_UP));
        }
        if (request.getAmountToleranceFloor() != null) {
            target.setAmountToleranceFloor(request.getAmountToleranceFloor().setScale(2, RoundingMode.HALF_UP));
        }
        if (request.getDateWindowDays() != null) target.setDateWindowDays(request.getDateWindowDays());
        if (request.getHighThreshold() != null) target.setHighThreshold(request.getHighThreshold());
        if (request.getMediumThreshold() != null) target.setMediumThreshold(request.getMediumThreshold());
        if (request.getMaxCandidates() != null) target.setMaxCandidates(request.getMaxCandidates());
    }

    private void validate(FinCashMatchRuleConfig config) {
        if (!StringUtils.hasText(config.getConfigName()) || config.getConfigName().length() > 80) {
            throw new BusinessException("规则名称不能为空且不能超过80字");
        }
        bounded(config.getCustomerExactWeight(), 0, 100, "客户精确匹配权重");
        bounded(config.getCustomerConflictPenalty(), 0, 100, "客户冲突扣分");
        bounded(config.getOrderNoWeight(), 0, 100, "报单号权重");
        bounded(config.getPayerAliasWeight(), 0, 100, "付款方别名权重");
        bounded(config.getPayerSimilarWeight(), 0, 100, "付款方相似权重");
        bounded(config.getAmountExactWeight(), 0, 100, "金额精确权重");
        bounded(config.getAmountNearWeight(), 0, 100, "金额接近权重");
        bounded(config.getSalesWeight(), 0, 100, "销售匹配权重");
        bounded(config.getDateWeight(), 0, 100, "日期权重");
        bounded(config.getDateWindowDays(), 0, 365, "日期窗口");
        bounded(config.getMediumThreshold(), 0, 99, "中置信度阈值");
        bounded(config.getHighThreshold(), 1, 100, "高置信度阈值");
        bounded(config.getMaxCandidates(), 10, 500, "候选数量");
        if (config.getHighThreshold() <= config.getMediumThreshold()) {
            throw new BusinessException("高置信度阈值必须大于中置信度阈值");
        }
        if (config.getAmountToleranceRate() == null || config.getAmountToleranceRate().signum() < 0
                || config.getAmountToleranceRate().compareTo(new BigDecimal("0.2500")) > 0) {
            throw new BusinessException("金额容差比例必须在0到25%之间");
        }
        if (config.getAmountToleranceFloor() == null || config.getAmountToleranceFloor().signum() < 0
                || config.getAmountToleranceFloor().compareTo(new BigDecimal("10000")) > 0) {
            throw new BusinessException("金额最小容差必须在0到10000元之间");
        }
    }

    private void bounded(Integer value, int min, int max, String label) {
        if (value == null || value < min || value > max) {
            throw new BusinessException(label + "必须在" + min + "到" + max + "之间");
        }
    }

    private FinCashMatchRuleConfig copy(FinCashMatchRuleConfig source) {
        FinCashMatchRuleConfig target = new FinCashMatchRuleConfig();
        target.setId(source.getId());
        target.setTenantId(source.getTenantId());
        target.setConfigName(source.getConfigName());
        target.setCustomerExactWeight(source.getCustomerExactWeight());
        target.setCustomerConflictPenalty(source.getCustomerConflictPenalty());
        target.setOrderNoWeight(source.getOrderNoWeight());
        target.setPayerAliasWeight(source.getPayerAliasWeight());
        target.setPayerSimilarWeight(source.getPayerSimilarWeight());
        target.setAmountExactWeight(source.getAmountExactWeight());
        target.setAmountNearWeight(source.getAmountNearWeight());
        target.setSalesWeight(source.getSalesWeight());
        target.setDateWeight(source.getDateWeight());
        target.setAmountToleranceRate(source.getAmountToleranceRate());
        target.setAmountToleranceFloor(source.getAmountToleranceFloor());
        target.setDateWindowDays(source.getDateWindowDays());
        target.setHighThreshold(source.getHighThreshold());
        target.setMediumThreshold(source.getMediumThreshold());
        target.setMaxCandidates(source.getMaxCandidates());
        target.setVersion(source.getVersion());
        target.setUpdateReason(source.getUpdateReason());
        target.setActivatedBy(source.getActivatedBy());
        target.setActivatedAt(source.getActivatedAt());
        return target;
    }

    private String json(FinCashMatchRuleConfig config) {
        try {
            return objectMapper.writeValueAsString(config);
        } catch (JsonProcessingException e) {
            throw new BusinessException("推荐规则审计快照生成失败");
        }
    }

    private String currentUserName() {
        Long userId = SecurityUtils.getCurrentUserId();
        SysUser user = userId == null ? null : sysUserMapper.selectById(userId);
        if (user == null) return null;
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private void assertManager() {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可管理推荐规则");
        }
    }
}
