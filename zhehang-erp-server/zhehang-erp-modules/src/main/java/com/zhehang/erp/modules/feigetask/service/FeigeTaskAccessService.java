package com.zhehang.erp.modules.feigetask.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeTaskOperationLog;
import com.zhehang.erp.modules.feigetask.mapper.FeigeTaskOperationLogMapper;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FeigeTaskAccessService {

    private final DataScopeHelper dataScopeHelper;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final FeigeTaskOperationLogMapper operationLogMapper;

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

    public String currentUserName() {
        return displayName(currentUser());
    }

    public void requireManager() {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            throw new AccessDeniedException("仅主管、老板或管理员可执行该操作");
        }
    }

    public boolean isManager() {
        return dataScopeHelper.isManagerOrAdmin();
    }

    /** 自动桥接会影响整个租户，仅超级管理员可配置或重试。 */
    public boolean isBridgeManager() {
        return SecurityUtils.isCurrentAdmin();
    }

    public void requireBridgeManager() {
        if (!isBridgeManager()) {
            throw new AccessDeniedException("仅超级管理员可管理订单任务自动桥接");
        }
    }

    public SysUser requireVisibleActiveUser(Long userId) {
        SysUser user = requireActiveUserInTenant(userId);
        if (!dataScopeHelper.canAccess(user.getId(), user.getDeptId())) {
            throw new AccessDeniedException("无权选择该员工");
        }
        return user;
    }

    public SysUser requireVisibleActiveUserInRole(Long userId, String roleKey) {
        SysUser user = requireVisibleActiveUser(userId);
        if (StringUtils.hasText(roleKey)) {
            List<String> roleKeys = userMapper.selectRoleKeysByUserId(userId);
            if (roleKeys == null || !roleKeys.contains(roleKey)) {
                throw new BusinessException("所选员工不具备当前审批角色");
            }
        }
        return user;
    }

    public SysUser requireActiveUserInTenant(Long userId) {
        if (userId == null) {
            throw new BusinessException("缺少员工ID");
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())
                || userMapper.existsResignedEmployee(userId, SecurityUtils.getCurrentTenantId())) {
            throw new BusinessException("员工不存在、已离职或账号已停用");
        }
        return user;
    }

    public SysRole requireActiveRole(Long roleId) {
        if (roleId == null) {
            throw new BusinessException("缺少角色ID");
        }
        SysRole role = roleMapper.selectById(roleId);
        if (role == null || !Integer.valueOf(0).equals(role.getStatus())) {
            throw new BusinessException("角色不存在或已停用");
        }
        return role;
    }

    public SysRole requireActiveRoleKey(String roleKey) {
        if (!StringUtils.hasText(roleKey)) {
            throw new BusinessException("缺少角色标识");
        }
        SysRole role = roleMapper.selectOne(new LambdaQueryWrapper<SysRole>()
                .eq(SysRole::getRoleKey, roleKey)
                .eq(SysRole::getStatus, 0)
                .last("LIMIT 1"));
        if (role == null) {
            throw new BusinessException("审批角色不存在或已停用");
        }
        return role;
    }

    public boolean canAccess(Long ownerId, Long deptId) {
        return dataScopeHelper.canAccess(ownerId, deptId);
    }

    public boolean canAccessUser(Long userId) {
        if (Objects.equals(currentUserId(), userId)) {
            return true;
        }
        SysUser user = userMapper.selectById(userId);
        return user != null && Integer.valueOf(0).equals(user.getStatus())
                && dataScopeHelper.canAccess(userId, user.getDeptId());
    }

    public boolean canClaimDepartment(Long deptId) {
        if (SecurityUtils.isCurrentAdmin() || Integer.valueOf(1).equals(SecurityUtils.getCurrentDataScope())) {
            return true;
        }
        Long currentDeptId = SecurityUtils.getCurrentDeptId();
        if (currentDeptId == null || deptId == null) {
            return false;
        }
        if (Objects.equals(currentDeptId, deptId)) {
            return true;
        }
        return Integer.valueOf(4).equals(SecurityUtils.getCurrentDataScope())
                && dataScopeHelper.deptSelfAndChildren(currentDeptId).contains(deptId);
    }

    public boolean hasCurrentRole(String roleKey) {
        return StringUtils.hasText(roleKey) && SecurityUtils.hasAnyRole(roleKey);
    }

    public List<Long> currentRoleIds() {
        List<Long> ids = userMapper.selectRoleIdsByUserId(currentUserId());
        return ids == null ? List.of() : ids;
    }

    public String displayName(SysUser user) {
        if (user == null) {
            return "";
        }
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    public void log(String domainType, Long businessId, String eventType,
                    String fromStatus, String toStatus, String detail, String payloadJson) {
        FeigeTaskOperationLog row = new FeigeTaskOperationLog();
        row.setDomainType(domainType);
        row.setBusinessId(businessId);
        row.setEventType(eventType);
        row.setFromStatus(fromStatus);
        row.setToStatus(toStatus);
        row.setOperatorId(currentUserId());
        row.setOperatorName(currentUserName());
        row.setDetail(detail);
        row.setPayloadJson(payloadJson);
        operationLogMapper.insert(row);
    }
}
