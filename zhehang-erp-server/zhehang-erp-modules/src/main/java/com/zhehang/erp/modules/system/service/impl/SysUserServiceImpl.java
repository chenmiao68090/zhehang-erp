package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.common.core.security.PasswordPolicy;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.vo.UserVO;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SysUserServiceImpl extends ServiceImpl<SysUserMapper, SysUser> implements ISysUserService {

    private static final Set<String> PRIVILEGED_ROLE_KEYS = Set.of(
            "admin", "super_admin", "sys_admin", "boss"
    );

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysDeptMapper deptMapper;
    private final TokenService tokenService;

    @Override
    public IPage<UserVO> selectUserPage(int pageNum, int pageSize, String username, String phone, Integer status) {
        Page<SysUser> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(username), SysUser::getUsername, username)
               .like(StringUtils.hasText(phone), SysUser::getPhone, phone)
               .eq(status != null, SysUser::getStatus, status)
               .orderByDesc(SysUser::getCreateTime);

        IPage<SysUser> userPage = userMapper.selectPage(page, wrapper);
        // 批量富化(消除N+1):基础转换后一次性补部门/角色,替代每用户查3次
        IPage<UserVO> voPage = userPage.convert(u -> {
            UserVO vo = new UserVO();
            BeanUtils.copyProperties(u, vo);
            return vo;
        });
        enrichUsersBatch(voPage.getRecords());
        return voPage;
    }

    @Override
    public UserVO selectUserById(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return toUserVO(user);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitialCredentialVO createUser(UserDTO dto) {
        rejectLegacyRoleAssignment(dto);
        validateUserStatus(dto.getStatus());
        // 校验用户名唯一
        long count = count(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUsername, dto.getUsername()));
        if (count > 0) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }
        SysUser user = new SysUser();
        BeanUtils.copyProperties(dto, user);
        String initialPassword = PasswordPolicy.generateInitialPassword();
        user.setPassword(SecurityUtils.encryptPassword(initialPassword));
        user.setMustChangePassword(1);
        user.setPasswordChangedAt(null);
        user.setMfaEnabled(0);
        user.setMfaSecret(null);
        user.setMfaEnrolledAt(null);
        if (userMapper.insert(user) <= 0) {
            throw new BusinessException("用户创建失败");
        }
        return new InitialCredentialVO(user.getUsername(), initialPassword, true);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(UserDTO dto) {
        rejectLegacyRoleAssignment(dto);
        validateUserStatus(dto.getStatus());
        SysUser user = userMapper.selectById(dto.getId());
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        assertCanManageTargetUser(user.getId());
        assertNotResignedWhenEnabling(user, dto.getStatus());
        // 记录变更前的权限上下文,用于判断是否需要让其重新登录。
        // 部门会直接参与数据范围计算；用户名参与管理员判断与审计，不能当成普通资料。
        Integer oldStatus = user.getStatus();
        Long oldDeptId = user.getDeptId();
        String oldUsername = user.getUsername();
        BeanUtils.copyProperties(dto, user, "password");
        // DTO 允许省略状态/部门；MyBatis-Plus 默认也不会把 null 更新进库。
        // 显式恢复旧值，确保后续安全差异判断与数据库真实写入一致，避免无变化误踢下线。
        if (dto.getStatus() == null) {
            user.setStatus(oldStatus);
        }
        if (dto.getDeptId() == null) {
            user.setDeptId(oldDeptId);
        }
        if (userMapper.updateById(user) <= 0) {
            throw new BusinessException("用户不存在或无权修改");
        }

        // 状态、部门或用户名变化会改变权限/数据范围/审计身份，必须立即作废会话；
        // 只改昵称、手机、邮箱等普通资料不再把员工踢下线。
        if (!Objects.equals(oldStatus, user.getStatus())
                || !Objects.equals(oldDeptId, user.getDeptId())
                || !Objects.equals(oldUsername, user.getUsername())) {
            tokenService.invalidateLoginUserSafely(user.getId());
        }
    }

    private void rejectLegacyRoleAssignment(UserDTO dto) {
        if (dto != null && dto.getRoleIds() != null) {
            throw new BusinessException("系统角色请统一在「角色管理 → 成员管理」设置");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long userId) {
        SysUser target = requireCurrentTenantUser(userId);
        assertCanManageTargetUser(target.getId());
        userMapper.deleteById(userId);
        roleMapper.deleteUserRoles(userId);
        tokenService.invalidateLoginUserSafely(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitialCredentialVO resetPassword(Long userId) {
        SysUser target = requireCurrentTenantUser(userId);
        assertCanManageTargetUser(target.getId());
        String initialPassword = PasswordPolicy.generateInitialPassword();
        int updated = userMapper.update(null, new UpdateWrapper<SysUser>()
                .eq("id", userId)
                .set("password", SecurityUtils.encryptPassword(initialPassword))
                .set("must_change_password", 1)
                .set("password_changed_at", null)
                .set("mfa_enabled", 0)
                .set("mfa_secret", null)
                .set("mfa_enrolled_at", null));
        if (updated <= 0) {
            throw new BusinessException("用户不存在或无权修改");
        }
        tokenService.invalidateLoginUserSafely(userId);
        return new InitialCredentialVO(target.getUsername(), initialPassword, true);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateMyPassword(String oldPassword, String newPassword) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("登录已失效,请重新登录");
        }
        SysUser current = userMapper.selectById(userId);
        if (current == null) {
            throw new BusinessException("用户不存在");
        }
        if (!SecurityUtils.matchesPassword(oldPassword, current.getPassword())) {
            throw new BusinessException("原密码不正确");
        }
        updatePasswordFields(current, newPassword, false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateInitialPassword(Long userId, String newPassword) {
        SysUser current = userMapper.selectById(userId);
        if (current == null || !Integer.valueOf(0).equals(current.getStatus())) {
            throw new BusinessException("账号不存在或已停用");
        }
        if (!Integer.valueOf(1).equals(current.getMustChangePassword())) {
            throw new BusinessException("该账号不需要首次改密，请重新登录");
        }
        updatePasswordFields(current, newPassword, true);
    }

    private void updatePasswordFields(SysUser current, String newPassword, boolean initialChange) {
        PasswordPolicy.validate(newPassword, current.getUsername());
        if (SecurityUtils.matchesPassword(newPassword, current.getPassword())) {
            throw new BusinessException("新密码不能与当前密码相同");
        }
        int updated = userMapper.update(null, new UpdateWrapper<SysUser>()
                .eq("id", current.getId())
                .eq(initialChange, "must_change_password", 1)
                .set("password", SecurityUtils.encryptPassword(newPassword))
                .set("must_change_password", 0)
                .set("password_changed_at", LocalDateTime.now()));
        if (updated <= 0) {
            throw new BusinessException("用户不存在或无权修改");
        }
        tokenService.invalidateLoginUserSafely(current.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resetMfa(Long userId) {
        SysUser target = requireCurrentTenantUser(userId);
        assertCanManageTargetUser(target.getId());
        int updated = userMapper.update(null, new UpdateWrapper<SysUser>()
                .eq("id", userId)
                .set("mfa_enabled", 0)
                .set("mfa_secret", null)
                .set("mfa_enrolled_at", null));
        if (updated <= 0) {
            throw new BusinessException("用户不存在或无权修改");
        }
        tokenService.invalidateLoginUserSafely(userId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateStatus(Long userId, Integer status) {
        if (status == null) {
            throw new BusinessException("用户状态只能是正常或停用");
        }
        validateUserStatus(status);
        SysUser target = requireCurrentTenantUser(userId);
        assertCanManageTargetUser(target.getId());
        assertNotResignedWhenEnabling(target, status);
        if (Objects.equals(target.getStatus(), status)) {
            return;
        }
        SysUser user = new SysUser();
        user.setId(userId);
        user.setStatus(status);
        if (userMapper.updateById(user) <= 0) {
            throw new BusinessException("用户不存在或无权修改");
        }
        tokenService.invalidateLoginUserSafely(userId);
    }

    /**
     * 离职是账号安全事件，不等同于普通“状态改为停用”。即使账号原本已停用，
     * 也必须再次提升个人认证版本，确保任何异常残留会话立即失效。
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void disableForResignation(Long userId) {
        if (userId == null) {
            return;
        }
        SysUser target = requireCurrentTenantUser(userId);
        assertResignationTargetAllowed(target.getId());
        assertCanManageTargetUser(target.getId());
        if (!Integer.valueOf(1).equals(target.getStatus())) {
            SysUser user = new SysUser();
            user.setId(userId);
            user.setStatus(1);
            if (userMapper.updateById(user) <= 0) {
                throw new BusinessException("用户不存在或无权修改");
            }
        }
        tokenService.invalidateLoginUserSafely(userId);
    }

    /**
     * 唯一最高管理员不能直接停号，否则租户会失去权限维护入口。
     * 应先在角色管理完成最高管理员交接，再办理原员工离职。
     */
    private void assertResignationTargetAllowed(Long userId) {
        if (Long.valueOf(1L).equals(userId)) {
            throw new BusinessException("平台管理员不能办理离职");
        }
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(userId);
        boolean canonicalSuperAdmin = roleKeys != null && roleKeys.stream()
                .filter(Objects::nonNull)
                .map(roleKey -> roleKey.trim().toLowerCase(Locale.ROOT))
                .anyMatch("super_admin"::equals);
        if (canonicalSuperAdmin) {
            throw new BusinessException("请先在角色管理完成唯一超级管理员交接，再办理该员工离职");
        }
    }

    private void validateUserStatus(Integer status) {
        if (status != null && status != 0 && status != 1) {
            throw new BusinessException("用户状态只能是正常或停用");
        }
    }

    private void assertNotResignedWhenEnabling(SysUser user, Integer requestedStatus) {
        if (!Integer.valueOf(0).equals(requestedStatus) || user == null
                || user.getId() == null || user.getTenantId() == null) {
            return;
        }
        if (userMapper.existsResignedEmployee(user.getId(), user.getTenantId())) {
            throw new BusinessException("离职员工不能启用登录，请先完成返聘并恢复在职状态");
        }
    }

    private UserVO toUserVO(SysUser user) {
        UserVO vo = new UserVO();
        BeanUtils.copyProperties(user, vo);
        if (user.getDeptId() != null) {
            SysDept dept = deptMapper.selectById(user.getDeptId());
            if (dept != null) {
                vo.setDeptName(dept.getDeptName());
            }
        }
        List<Long> roleIds = userMapper.selectRoleIdsByUserId(user.getId());
        vo.setRoleIds(roleIds);
        if (CollectionUtils.isEmpty(roleIds)) {
            vo.setRoleNames(Collections.emptyList());
        } else {
            vo.setRoleNames(roleMapper.selectBatchIds(roleIds).stream()
                    .map(SysRole::getRoleName)
                    .collect(Collectors.toList()));
        }
        return vo;
    }

    /** 批量富化用户列表的部门名/角色(消除分页N+1:每用户3次→整页3次) */
    private void enrichUsersBatch(List<UserVO> users) {
        if (users == null || users.isEmpty()) {
            return;
        }
        List<Long> deptIds = users.stream().map(UserVO::getDeptId)
                .filter(java.util.Objects::nonNull).distinct().collect(Collectors.toList());
        java.util.Map<Long, String> deptNameMap = deptIds.isEmpty() ? Collections.emptyMap()
                : deptMapper.selectBatchIds(deptIds).stream()
                        .collect(Collectors.toMap(SysDept::getId, SysDept::getDeptName, (a, b) -> a));
        List<Long> userIds = users.stream().map(UserVO::getId)
                .filter(java.util.Objects::nonNull).distinct().collect(Collectors.toList());
        java.util.Map<Long, List<Long>> userRoleIds = new java.util.HashMap<>();
        if (!userIds.isEmpty()) {
            for (java.util.Map<String, Object> row : userMapper.selectUserRoleMappings(userIds)) {
                Object uid = row.get("userId");
                Object rid = row.get("roleId");
                if (uid != null && rid != null) {
                    userRoleIds.computeIfAbsent(((Number) uid).longValue(), k -> new java.util.ArrayList<>())
                            .add(((Number) rid).longValue());
                }
            }
        }
        List<Long> allRoleIds = userRoleIds.values().stream()
                .flatMap(List::stream).distinct().collect(Collectors.toList());
        java.util.Map<Long, String> roleNameMap = allRoleIds.isEmpty() ? Collections.emptyMap()
                : roleMapper.selectBatchIds(allRoleIds).stream()
                        .collect(Collectors.toMap(SysRole::getId, SysRole::getRoleName, (a, b) -> a));
        for (UserVO vo : users) {
            if (vo.getDeptId() != null) {
                vo.setDeptName(deptNameMap.get(vo.getDeptId()));
            }
            List<Long> rids = userRoleIds.getOrDefault(vo.getId(), Collections.emptyList());
            vo.setRoleIds(rids);
            vo.setRoleNames(rids.stream().map(roleNameMap::get)
                    .filter(java.util.Objects::nonNull).collect(Collectors.toList()));
        }
    }

    /** 仅真实登录的超级管理员可维护特权账号；平台账号自身仍不可由租户超管维护。 */
    private void assertCanManageTargetUser(Long userId) {
        if (isPlatformAccount()) {
            return;
        }
        if (Long.valueOf(1L).equals(userId)) {
            throw new AccessDeniedException("仅平台管理员可维护平台账号");
        }
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(userId);
        if (roleKeys != null && roleKeys.stream().anyMatch(this::isPrivilegedRoleKey)
                && !canManagePrivilegedAccounts()) {
            throw new AccessDeniedException("仅超级管理员可维护特权账号");
        }
    }

    private SysUser requireCurrentTenantUser(Long userId) {
        if (userId == null) {
            throw new BusinessException("缺少用户ID");
        }
        SysUser user = userMapper.selectById(userId);
        Long tenantId = requireCurrentTenantId();
        if (user == null || !tenantId.equals(user.getTenantId())) {
            throw new BusinessException("用户不存在或不属于当前租户");
        }
        return user;
    }

    private boolean isPrivilegedRole(SysRole role) {
        return role != null && isPrivilegedRoleKey(role.getRoleKey());
    }

    private boolean isPrivilegedRoleKey(String roleKey) {
        return roleKey != null && PRIVILEGED_ROLE_KEYS.contains(roleKey.trim().toLowerCase(Locale.ROOT));
    }

    private Long requireCurrentTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("无法识别当前租户");
        }
        return tenantId;
    }

    private boolean isPlatformAccount() {
        return Long.valueOf(1L).equals(SecurityUtils.getCurrentUserId());
    }

    private boolean canManagePrivilegedAccounts() {
        return SecurityUtils.canManageTenantSuperAdmin();
    }
}
