package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmHoldingService;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CrmLeadServiceImpl extends ServiceImpl<CrmLeadMapper, CrmLead> implements ICrmLeadService {

    /** 释放后冷却:原跟进人 15 天内不可再领同一线索 */
    private static final String COOLDOWN_KEY = "crm:claim:cooldown:";
    private static final long COOLDOWN_DAYS = 15L;
    /** 每日领取上限 */
    private static final String DAILY_KEY = "crm:claim:daily:";
    private static final long DAILY_LIMIT = 50L;

    private final CrmLeadMapper leadMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ICrmHoldingService holdingService;

    @Override
    public IPage<CrmLead> selectPage(int pageNum, int pageSize, String name, Integer source, Integer status, Long ownerId) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(name), CrmLead::getName, name)
               .eq(source != null, CrmLead::getSource, source)
               .eq(status != null, CrmLead::getStatus, status)
               .eq(ownerId != null, CrmLead::getOwnerId, ownerId)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void convertToCustomer(Long id) {
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (lead.getStatus() == 3) {
            throw new BusinessException("该线索已转化");
        }

        // 创建客户
        CrmCustomer customer = new CrmCustomer();
        customer.setName(lead.getCompany() != null ? lead.getCompany() : lead.getName());
        customer.setSource("线索转化");
        customer.setLevel("C");
        customer.setTaxpayerType(1);
        customer.setStatus(0);
        customer.setOwnerId(lead.getOwnerId());
        customerMapper.insert(customer);

        // 创建联系人
        CrmContact contact = new CrmContact();
        contact.setCustomerId(customer.getId());
        contact.setName(lead.getName());
        contact.setPhone(lead.getPhone());
        contact.setEmail(lead.getEmail());
        contact.setIsPrimary(1);
        contactMapper.insert(contact);

        // 更新线索状态为已转化
        lead.setStatus(3);
        leadMapper.updateById(lead);
    }

    @Override
    public void assignLead(Long id, Long ownerId) {
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        lead.setOwnerId(ownerId);
        leadMapper.updateById(lead);
    }

    @Override
    public IPage<CrmLead> selectPoolPage(int pageNum, int pageSize, String name, Long poolId) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "pool")
               .like(StringUtils.hasText(name), CrmLead::getName, name)
               .eq(poolId != null, CrmLead::getPoolId, poolId)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public IPage<CrmLead> selectMyPage(int pageNum, int pageSize, String name, Integer status) {
        Long userId = SecurityUtils.getCurrentUserId();
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnerId, userId)
               .eq(CrmLead::getOwnership, "private")
               .like(StringUtils.hasText(name), CrmLead::getName, name)
               .eq(status != null, CrmLead::getStatus, status)
               .orderByDesc(CrmLead::getLastFollowTime)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void claim(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("未登录,无法领取");
        }
        // 每日领取上限校验
        long todayCount = currentDailyClaim(userId);
        if (todayCount + ids.size() > DAILY_LIMIT) {
            throw new BusinessException("超出每日领取上限(" + DAILY_LIMIT + "),今日已领取 " + todayCount + " 条");
        }
        // 持有上限校验:当前私海持有 + 本次领取不得超过角色上限
        Map<String, Object> holding = holdingService.currentHolding(userId);
        long currentHolding = ((Number) holding.get("current")).longValue();
        int maxHolding = ((Number) holding.get("max")).intValue();
        if (currentHolding + ids.size() > maxHolding) {
            throw new BusinessException("超出持有上限(" + maxHolding + "),当前已持有 " + currentHolding + " 条,请先跟进或释放部分客资");
        }

        LocalDateTime now = LocalDateTime.now();
        for (Long id : ids) {
            // 冷却期:原跟进人释放后 15 天内不可再领
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(COOLDOWN_KEY + userId + ":" + id))) {
                CrmLead l = leadMapper.selectById(id);
                throw new BusinessException("线索「" + (l != null ? l.getName() : id) + "」处于冷却期,暂不可再次领取");
            }
            // 原子领取:仅当线索仍在公海时更新成功(DB 行锁保证并发下只有一人成功,
            // 避免"读-判断-写"在事务提交前被其他事务读到旧值导致的双重领取)
            boolean claimed = lambdaUpdate()
                    .eq(CrmLead::getId, id)
                    .eq(CrmLead::getOwnership, "pool")
                    .set(CrmLead::getOwnerId, userId)
                    .set(CrmLead::getOwnership, "private")
                    .set(CrmLead::getClaimTime, now)
                    .set(CrmLead::getStatus, 2)
                    .update();
            if (!claimed) {
                CrmLead l = leadMapper.selectById(id);
                throw new BusinessException("线索「" + (l != null ? l.getName() : id) + "」已被领取或不存在");
            }
            incrDailyClaim(userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnToPool(List<Long> ids, String reason) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            // 退回前,给原跟进人设置 15 天冷却,期内不可再领同一线索
            if (lead.getOwnerId() != null) {
                stringRedisTemplate.opsForValue().set(
                        COOLDOWN_KEY + lead.getOwnerId() + ":" + id, "1", COOLDOWN_DAYS, TimeUnit.DAYS);
            }
            lead.setOwnerId(null);
            lead.setOwnership("pool");
            if (StringUtils.hasText(reason)) {
                lead.setLastFollowContent("退回公海:" + reason);
            }
            leadMapper.updateById(lead);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void distribute(List<Long> ids, Long ownerId) {
        if (ids == null || ids.isEmpty() || ownerId == null) {
            return;
        }
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            lead.setOwnerId(ownerId);
            lead.setOwnership("private");
            lead.setClaimTime(LocalDateTime.now());
            leadMapper.updateById(lead);
        }
    }

    @Override
    public List<CrmLead> checkDuplicate(String phone, String name) {
        boolean hasPhone = StringUtils.hasText(phone);
        boolean hasName = StringUtils.hasText(name);
        if (!hasPhone && !hasName) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w
                .eq(hasPhone, CrmLead::getPhone, phone)
                .or(hasPhone && hasName)
                .eq(hasName, CrmLead::getName, name));
        return leadMapper.selectList(wrapper);
    }

    @Override
    public List<Map<String, Object>> sourceStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("source", "COUNT(*) AS cnt").groupBy("source").orderByDesc("cnt");
        return leadMapper.selectMaps(qw);
    }

    @Override
    public List<Map<String, Object>> stageStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("status", "COUNT(*) AS cnt").groupBy("status").orderByAsc("status");
        return leadMapper.selectMaps(qw);
    }

    /** 当前用户今日已领取数量 */
    private long currentDailyClaim(Long userId) {
        String v = stringRedisTemplate.opsForValue().get(DAILY_KEY + userId + ":" + LocalDate.now());
        return v == null ? 0L : Long.parseLong(v);
    }

    /** 今日领取计数 +1,首次写入时设置当日过期 */
    private void incrDailyClaim(Long userId) {
        String key = DAILY_KEY + userId + ":" + LocalDate.now();
        Long c = stringRedisTemplate.opsForValue().increment(key);
        if (c != null && c == 1L) {
            long secs = Duration.between(LocalDateTime.now(), LocalDate.now().atTime(LocalTime.MAX)).getSeconds() + 1;
            stringRedisTemplate.expire(key, secs, TimeUnit.SECONDS);
        }
    }
}
