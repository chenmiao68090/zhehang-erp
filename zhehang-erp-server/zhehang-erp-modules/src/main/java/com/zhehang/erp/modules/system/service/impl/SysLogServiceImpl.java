package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysLoginLogMapper;
import com.zhehang.erp.modules.system.mapper.SysOperLogMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SysLogServiceImpl implements ISysLogService {

    private final SysLoginLogMapper loginLogMapper;
    private final SysOperLogMapper operLogMapper;
    private final SysUserMapper userMapper;
    private final OrgEmployeeMapper employeeMapper;

    @Override
    public IPage<SysLoginLog> selectLoginLogPage(int pageNum, int pageSize, String username, String ipAddr, Integer status, String beginTime, String endTime) {
        Page<SysLoginLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysLoginLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(username), SysLoginLog::getUsername, username)
               .like(StringUtils.hasText(ipAddr), SysLoginLog::getIpAddr, ipAddr)
               .eq(status != null, SysLoginLog::getStatus, status);
        if (StringUtils.hasText(beginTime)) {
            wrapper.ge(SysLoginLog::getLoginTime, LocalDateTime.of(LocalDate.parse(beginTime), LocalTime.MIN));
        }
        if (StringUtils.hasText(endTime)) {
            wrapper.le(SysLoginLog::getLoginTime, LocalDateTime.of(LocalDate.parse(endTime), LocalTime.MAX));
        }
        wrapper.orderByDesc(SysLoginLog::getLoginTime);
        return loginLogMapper.selectPage(page, wrapper);
    }

    @Override
    public IPage<SysOperLog> selectOperLogPage(int pageNum, int pageSize, String module, String operType, String operator, String beginTime, String endTime) {
        Page<SysOperLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOperLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(module), SysOperLog::getModule, module)
               .eq(StringUtils.hasText(operType), SysOperLog::getOperType, operType);
        applyOperatorFilter(wrapper, operator);
        if (StringUtils.hasText(beginTime)) {
            wrapper.ge(SysOperLog::getOperTime, LocalDateTime.of(LocalDate.parse(beginTime), LocalTime.MIN));
        }
        if (StringUtils.hasText(endTime)) {
            wrapper.le(SysOperLog::getOperTime, LocalDateTime.of(LocalDate.parse(endTime), LocalTime.MAX));
        }
        wrapper.orderByDesc(SysOperLog::getOperTime);
        IPage<SysOperLog> result = operLogMapper.selectPage(page, wrapper);
        fillOperatorName(result.getRecords());
        return result;
    }

    @Override
    public SysOperLog getOperLogById(Long id) {
        SysOperLog log = operLogMapper.selectById(id);
        fillOperatorName(log == null ? List.of() : List.of(log));
        return log;
    }

    @Override
    public void saveOperLog(SysOperLog operLog) {
        operLogMapper.insert(operLog);
    }

    @Override
    public void saveLoginLog(SysLoginLog loginLog) {
        loginLogMapper.insert(loginLog);
    }

    @Override
    public void cleanLoginLog() {
        loginLogMapper.delete(new LambdaQueryWrapper<>());
    }

    @Override
    public void cleanOperLog() {
        operLogMapper.delete(new LambdaQueryWrapper<>());
    }

    private void fillOperatorName(List<SysOperLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return;
        }

        Set<Long> userIds = logs.stream()
                .map(SysOperLog::getOperatorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> operatorKeys = logs.stream()
                .map(SysOperLog::getOperator)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());

        Map<Long, String> nameById = new HashMap<>();
        Map<String, String> nameByKey = new HashMap<>();
        Map<Long, SysUser> userById = new HashMap<>();

        if (!userIds.isEmpty()) {
            List<SysUser> users = userMapper.selectBatchIds(userIds);
            for (SysUser user : users) {
                String displayName = displayName(user);
                userById.put(user.getId(), user);
                nameById.put(user.getId(), displayName);
                putUserKeys(nameByKey, user, displayName);
            }
        }

        if (!operatorKeys.isEmpty()) {
            LambdaQueryWrapper<SysUser> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.and(w -> w.in(SysUser::getUsername, operatorKeys).or().in(SysUser::getPhone, operatorKeys));
            List<SysUser> users = userMapper.selectList(userWrapper);
            for (SysUser user : users) {
                String displayName = displayName(user);
                userById.put(user.getId(), user);
                nameById.put(user.getId(), displayName);
                putUserKeys(nameByKey, user, displayName);
            }
        }

        fillEmployeeNames(nameById, nameByKey, userById, operatorKeys);

        for (SysOperLog log : logs) {
            String displayName = null;
            if (log.getOperatorId() != null) {
                displayName = nameById.get(log.getOperatorId());
            }
            if (!StringUtils.hasText(displayName) && StringUtils.hasText(log.getOperator())) {
                displayName = nameByKey.get(log.getOperator());
            }
            if (StringUtils.hasText(displayName)) {
                log.setOperator(displayName);
            }
        }
    }

    private void applyOperatorFilter(LambdaQueryWrapper<SysOperLog> wrapper, String operator) {
        if (!StringUtils.hasText(operator)) {
            return;
        }

        Set<Long> matchedUserIds = new HashSet<>();
        Set<String> matchedOperatorKeys = new HashSet<>();

        List<SysUser> users = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .like(SysUser::getNickname, operator)
                .or()
                .like(SysUser::getUsername, operator)
                .or()
                .like(SysUser::getPhone, operator));
        for (SysUser user : users) {
            if (user.getId() != null) {
                matchedUserIds.add(user.getId());
            }
            addIfHasText(matchedOperatorKeys, user.getNickname());
            addIfHasText(matchedOperatorKeys, user.getUsername());
            addIfHasText(matchedOperatorKeys, user.getPhone());
        }

        List<OrgEmployee> employees = employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .like(OrgEmployee::getName, operator)
                .or()
                .like(OrgEmployee::getPhone, operator));
        for (OrgEmployee employee : employees) {
            if (employee.getUserId() != null) {
                matchedUserIds.add(employee.getUserId());
            }
            addIfHasText(matchedOperatorKeys, employee.getName());
            addIfHasText(matchedOperatorKeys, employee.getPhone());
        }

        wrapper.and(w -> {
            w.like(SysOperLog::getOperator, operator);
            if (!matchedUserIds.isEmpty()) {
                w.or().in(SysOperLog::getOperatorId, matchedUserIds);
            }
            if (!matchedOperatorKeys.isEmpty()) {
                w.or().in(SysOperLog::getOperator, matchedOperatorKeys);
            }
        });
    }

    private void fillEmployeeNames(Map<Long, String> nameById,
                                   Map<String, String> nameByKey,
                                   Map<Long, SysUser> userById,
                                   Set<String> operatorKeys) {
        Set<Long> relatedUserIds = new HashSet<>(nameById.keySet());
        boolean hasUserIds = !relatedUserIds.isEmpty();
        boolean hasOperatorKeys = operatorKeys != null && !operatorKeys.isEmpty();
        if (!hasUserIds && !hasOperatorKeys) {
            return;
        }

        LambdaQueryWrapper<OrgEmployee> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> {
            boolean added = false;
            if (hasUserIds) {
                w.in(OrgEmployee::getUserId, relatedUserIds);
                added = true;
            }
            if (hasOperatorKeys) {
                if (added) {
                    w.or();
                }
                w.in(OrgEmployee::getPhone, operatorKeys);
            }
        });

        List<OrgEmployee> employees = employeeMapper.selectList(wrapper);
        for (OrgEmployee employee : employees) {
            if (!StringUtils.hasText(employee.getName())) {
                continue;
            }
            if (employee.getUserId() != null) {
                nameById.put(employee.getUserId(), employee.getName());
                SysUser user = userById.get(employee.getUserId());
                if (user != null) {
                    putUserKeys(nameByKey, user, employee.getName());
                }
            }
            addMapping(nameByKey, employee.getPhone(), employee.getName());
        }
    }

    private void putUserKeys(Map<String, String> nameByKey, SysUser user, String displayName) {
        Set<String> keys = new HashSet<>();
        keys.add(user.getUsername());
        keys.add(user.getPhone());
        keys.add(user.getNickname());
        keys.stream()
                .filter(StringUtils::hasText)
                .forEach(key -> nameByKey.put(key, displayName));
    }

    private String displayName(SysUser user) {
        if (StringUtils.hasText(user.getNickname())) {
            return user.getNickname();
        }
        if (StringUtils.hasText(user.getUsername())) {
            return user.getUsername();
        }
        if (StringUtils.hasText(user.getPhone())) {
            return user.getPhone();
        }
        return "未知用户";
    }

    private void addMapping(Map<String, String> map, String key, String value) {
        if (StringUtils.hasText(key) && StringUtils.hasText(value)) {
            map.put(key, value);
        }
    }

    private void addIfHasText(Set<String> values, String value) {
        if (StringUtils.hasText(value)) {
            values.add(value);
        }
    }
}
