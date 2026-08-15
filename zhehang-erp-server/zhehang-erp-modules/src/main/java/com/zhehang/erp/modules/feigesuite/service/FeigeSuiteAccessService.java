package com.zhehang.erp.modules.feigesuite.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigesuite.domain.entity.FeigeSuiteRecord;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FeigeSuiteAccessService {
    private final DataScopeHelper dataScopeHelper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;

    public Long currentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null || SecurityUtils.getCurrentTenantId() == null) {
            throw new AccessDeniedException("缺少有效的登录租户上下文");
        }
        return userId;
    }

    public SysUser currentUser() {
        SysUser user = userMapper.selectById(currentUserId());
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())
                || userMapper.existsResignedEmployee(user.getId(), SecurityUtils.getCurrentTenantId())) {
            throw new AccessDeniedException("当前账号不存在或已停用");
        }
        return user;
    }

    public String displayName(SysUser user) {
        if (user == null) return "";
        return user.getNickname() == null || user.getNickname().isBlank() ? user.getUsername() : user.getNickname();
    }

    public String deptName(Long deptId) {
        SysDept dept = deptId == null ? null : deptMapper.selectById(deptId);
        return dept == null ? null : dept.getDeptName();
    }

    public boolean isManager() {
        return dataScopeHelper.isManagerOrAdmin();
    }

    public boolean isFinance() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "finance", "finance_hq");
    }

    public boolean isHr() {
        return dataScopeHelper.isHrAdminOrBoss();
    }

    public void requireRead(FeigeSuitePageRegistry.PageDefinition definition) {
        currentUser();
        boolean allowed = switch (definition.audience()) {
            case AUTHENTICATED -> true;
            case MANAGER -> isManager();
            case FINANCE -> isFinance();
            case HR -> isHr();
            case FINANCE_OR_MANAGER -> isFinance() || isManager();
        };
        if (!allowed) {
            throw new AccessDeniedException("无权访问该业务页面");
        }
    }

    public void requireCreate(FeigeSuitePageRegistry.PageDefinition definition, Long ownerId) {
        requireRead(definition);
        if (definition.managerWrite() && !canManageDefinition(definition)) {
            throw new AccessDeniedException("仅主管或对应职能管理员可新增该类记录");
        }
        Long targetOwnerId = ownerId == null ? currentUserId() : ownerId;
        requireOwnerAssignment(definition, currentUserId(), targetOwnerId);
        requireVisibleOwner(targetOwnerId);
    }

    public void requireReadRecord(FeigeSuitePageRegistry.PageDefinition definition, FeigeSuiteRecord record) {
        requireRead(definition);
        if (definition.scope() == FeigeSuitePageRegistry.Scope.VISIBLE_USERS
                && !dataScopeHelper.canAccess(record.getOwnerId(), record.getDeptId())) {
            throw new AccessDeniedException("无权查看该记录");
        }
    }

    public void requireWriteRecord(FeigeSuitePageRegistry.PageDefinition definition, FeigeSuiteRecord record) {
        requireReadRecord(definition, record);
        if (definition.managerWrite() && !canManageDefinition(definition)) {
            throw new AccessDeniedException("仅主管或对应职能管理员可操作该记录");
        }
        if (!definition.managerWrite() && !Objects.equals(currentUserId(), record.getOwnerId()) && !isManager()) {
            throw new AccessDeniedException("只能操作本人记录");
        }
    }

    public void applyScope(FeigeSuitePageRegistry.PageDefinition definition,
                           LambdaQueryWrapper<FeigeSuiteRecord> wrapper) {
        requireRead(definition);
        if (definition.scope() == FeigeSuitePageRegistry.Scope.VISIBLE_USERS) {
            dataScopeHelper.apply(wrapper, FeigeSuiteRecord::getOwnerId, FeigeSuiteRecord::getDeptId);
        }
    }

    public SysUser requireVisibleOwner(Long ownerId) {
        SysUser user = userMapper.selectById(ownerId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())
                || userMapper.existsResignedEmployee(ownerId, SecurityUtils.getCurrentTenantId())) {
            throw new AccessDeniedException("所选员工不存在、已离职或账号已停用");
        }
        if (!dataScopeHelper.canAccess(user.getId(), user.getDeptId())) {
            throw new AccessDeniedException("无权选择该员工");
        }
        return user;
    }

    public List<Map<String, Object>> staffOptions() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getStatus, 0)
                .orderByAsc(SysUser::getId);
        if (visibleIds != null) wrapper.in(SysUser::getId, visibleIds);
        return userMapper.selectList(wrapper).stream()
                .filter(user -> !userMapper.existsResignedEmployee(user.getId(), tenantId))
                .map(user -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", user.getId());
                    row.put("name", displayName(user));
                    row.put("deptId", user.getDeptId());
                    row.put("deptName", deptName(user.getDeptId()));
                    return row;
                }).toList();
    }

    public Map<String, Object> capabilities(FeigeSuitePageRegistry.PageDefinition definition) {
        requireRead(definition);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("manager", isManager());
        result.put("finance", isFinance());
        result.put("hr", isHr());
        result.put("canCreate", !definition.managerWrite() || canManageDefinition(definition));
        result.put("canWrite", !definition.managerWrite() || canManageDefinition(definition));
        result.put("canManage", canManageDefinition(definition));
        result.put("scope", definition.scope().name().toLowerCase());
        return result;
    }

    public void requireOwnerAssignment(FeigeSuitePageRegistry.PageDefinition definition,
                                       Long currentOwnerId, Long targetOwnerId) {
        if (!Objects.equals(currentOwnerId, targetOwnerId) && !canManageDefinition(definition)) {
            throw new AccessDeniedException("仅主管或对应职能管理员可变更负责人");
        }
    }

    private boolean canManageDefinition(FeigeSuitePageRegistry.PageDefinition definition) {
        return switch (definition.audience()) {
            case FINANCE -> isFinance();
            case HR -> isHr();
            case FINANCE_OR_MANAGER -> isFinance() || isManager();
            default -> isManager();
        };
    }
}
