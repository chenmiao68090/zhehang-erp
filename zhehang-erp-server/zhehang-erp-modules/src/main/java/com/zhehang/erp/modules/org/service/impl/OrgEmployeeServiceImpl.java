package com.zhehang.erp.modules.org.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.security.PasswordPolicy;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.org.domain.dto.EmployeeDTO;
import com.zhehang.erp.modules.org.domain.dto.EmployeeResignDTO;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.vo.EmployeeContractExpiryVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeVO;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.service.IOrgEmployeeService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysRoleMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.security.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OrgEmployeeServiceImpl extends ServiceImpl<OrgEmployeeMapper, OrgEmployee> implements IOrgEmployeeService {

    private static final Set<String> PRIVILEGED_ROLE_KEYS = Set.of(
            "admin", "super_admin", "sys_admin", "boss"
    );

    private final OrgEmployeeMapper employeeMapper;
    private final DataScopeHelper dataScopeHelper;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final TokenService tokenService;
    private final ISysUserService sysUserService;
    private static final Pattern EMP_CODE_SUFFIX_PATTERN = Pattern.compile("(\\d+)$");

    @Override
    public IPage<EmployeeVO> selectEmployeePage(int pageNum, int pageSize, String name, Long deptId, Long postId, Integer status) {
        return selectEmployeePage(pageNum, pageSize, name, deptId, postId, status, false);
    }

    @Override
    public IPage<EmployeeVO> selectEmployeePage(int pageNum, int pageSize, String name, Long deptId, Long postId,
                                                 Integer status, Boolean excludeResigned) {
        // 数据范围:员工档案含身份证/手机等PII。HR/管理员看全部;其余员工只能看自己那一条
        if (!dataScopeHelper.hasPerm("hr:employee:view_all")) {
            Page<EmployeeVO> p = new Page<>(pageNum, pageSize);
            Long myEmp = dataScopeHelper.currentEmployeeId();
            if (myEmp == null) {
                return p; // 无员工档案映射→空
            }
            EmployeeVO vo = employeeMapper.selectEmployeeById(myEmp);
            boolean hideOwnResignedRecord = status == null
                    && Boolean.TRUE.equals(excludeResigned)
                    && vo != null
                    && Integer.valueOf(3).equals(vo.getStatus());
            if (vo != null && !hideOwnResignedRecord) {
                enrichEmployeeAccount(vo);
                p.setRecords(java.util.List.of(vo));
                p.setTotal(1);
            }
            return p;
        }
        Page<?> page = new Page<>(pageNum, pageSize);
        IPage<EmployeeVO> result = employeeMapper.selectEmployeePage(
                page, name, deptId, postId, status, Boolean.TRUE.equals(excludeResigned));
        enrichEmployeeAccounts(result.getRecords());
        return result;
    }

    @Override
    public List<EmployeeRosterVO> selectRoster() {
        // 花名册无 PII,但仍只放给能设假期额度的角色(HR/管理员/老板),口径与额度设置/删除一致;其余失败收紧→空列表
        if (!dataScopeHelper.hasPerm("hr:employee:view_all")) {
            return Collections.emptyList();
        }
        return employeeMapper.selectRoster();
    }

    @Override
    public List<EmployeeRosterVO> selectEmployeeOptions() {
        // 该查询专为全员选人设计，SQL 只取 EmployeeRosterVO 定义的最小字段。
        return employeeMapper.selectActiveOptions();
    }

    @Override
    public List<EmployeeContractExpiryVO> selectContractExpiring(int days) {
        int safeDays = Math.max(1, Math.min(days, 365));
        LocalDate today = LocalDate.now();
        return employeeMapper.selectContractExpiring(today, today.plusDays(safeDays));
    }

    @Override
    public EmployeeVO selectCurrentEmployee() {
        Long myEmployeeId = dataScopeHelper.currentEmployeeId();
        if (myEmployeeId == null) {
            throw new BusinessException("当前账号尚未关联员工档案");
        }
        return selectEmployeeById(myEmployeeId);
    }

    @Override
    public EmployeeVO selectEmployeeById(Long id) {
        if (!dataScopeHelper.hasPerm("hr:employee:view_all")) {
            Long myEmployeeId = dataScopeHelper.currentEmployeeId();
            if (myEmployeeId == null || !myEmployeeId.equals(id)) {
                throw new BusinessException("无权查看其他员工档案");
            }
        }
        EmployeeVO vo = employeeMapper.selectEmployeeById(id);
        if (vo == null) {
            throw new BusinessException("员工不存在");
        }
        enrichEmployeeAccount(vo);
        return vo;
    }

    @Override
    public String generateNextEmpCode() {
        List<OrgEmployee> employees = list(new LambdaQueryWrapper<OrgEmployee>()
                .select(OrgEmployee::getEmpCode)
                .isNotNull(OrgEmployee::getEmpCode));
        Set<String> existing = new HashSet<>();
        int max = 0;
        for (OrgEmployee employee : employees) {
            String code = employee.getEmpCode();
            if (!StringUtils.hasText(code)) {
                continue;
            }
            String normalized = code.trim();
            existing.add(normalized);
            Matcher matcher = EMP_CODE_SUFFIX_PATTERN.matcher(normalized);
            if (matcher.find()) {
                try {
                    max = Math.max(max, Integer.parseInt(matcher.group(1)));
                } catch (NumberFormatException ignored) {
                    // 超大异常编号直接跳过,不影响自动生成。
                }
            }
        }
        int next = max + 1;
        String code;
        do {
            code = "ZH" + String.format("%03d", next++);
        } while (existing.contains(code));
        return code;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitialCredentialVO createEmployee(EmployeeDTO dto) {
        clearUnauthorizedAccountSecurityFields(dto);
        dto.setEmpCode(resolveEmpCodeForCreate(dto));
        // 校验工号唯一
        long count = count(new LambdaQueryWrapper<OrgEmployee>().eq(OrgEmployee::getEmpCode, dto.getEmpCode()));
        if (count > 0) {
            throw new BusinessException("员工工号已存在");
        }
        OrgEmployee employee = new OrgEmployee();
        BeanUtils.copyProperties(dto, employee);
        if (employee.getStatus() == null) {
            employee.setStatus(2); // 默认试用状态
        }
        if (Integer.valueOf(3).equals(employee.getStatus())) {
            validateImmediateResignDate(employee, employee.getResignDate());
        }
        if (employeeMapper.insert(employee) <= 0) {
            throw new BusinessException("员工档案创建失败");
        }
        InitialCredentialVO initialCredential = syncEmployeeAccount(employee, dto, false);
        // 同步系统角色(dto.roleIds 非 null 时全量替换,无账号则跳过)
        syncEmployeeRoles(dto, employee);
        if (Integer.valueOf(3).equals(employee.getStatus())) {
            // 历史补录也遵守统一安全不变量：有关联账号就再次停用并提升认证版本。
            sysUserService.disableForResignation(employee.getUserId());
        }
        return initialCredential;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitialCredentialVO updateEmployee(EmployeeDTO dto) {
        clearUnauthorizedAccountSecurityFields(dto);
        OrgEmployee employee = employeeMapper.selectById(dto.getId());
        if (employee == null) {
            throw new BusinessException("员工不存在");
        }
        dto.setEmpCode(resolveEmpCodeForUpdate(dto, employee));
        // 检查工号唯一性（排除自身）
        long count = count(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getEmpCode, dto.getEmpCode())
                .ne(OrgEmployee::getId, dto.getId()));
        if (count > 0) {
            throw new BusinessException("员工工号已存在");
        }
        Long oldUserId = employee.getUserId();
        Integer oldStatus = employee.getStatus();
        LocalDate persistedHireDate = employee.getHireDate();
        BeanUtils.copyProperties(dto, employee);
        if (dto.getUserId() == null) {
            employee.setUserId(oldUserId);
        }
        if (dto.getStatus() == null) {
            employee.setStatus(oldStatus);
        }
        // 普通编辑不能承担返聘语义。尤其要阻止“先打开编辑页、另一人随后办理离职、
        // 再保存旧表单”把离职档案和停用账号一并复活。返聘必须走未来的专用流程。
        if (Integer.valueOf(3).equals(oldStatus)
                && !Integer.valueOf(3).equals(employee.getStatus())) {
            throw new BusinessException("离职员工不能通过普通编辑恢复，请使用专用返聘流程");
        }
        boolean becameResigned = !Integer.valueOf(3).equals(oldStatus)
                && Integer.valueOf(3).equals(employee.getStatus());
        if (becameResigned) {
            if (!Integer.valueOf(1).equals(oldStatus) && !Integer.valueOf(2).equals(oldStatus)) {
                throw new BusinessException("仅在职或试用员工可以办理离职");
            }
            validateImmediateResignDate(employee, employee.getResignDate(), persistedHireDate);
        } else if (Integer.valueOf(3).equals(oldStatus)
                && Integer.valueOf(3).equals(employee.getStatus())
                && employee.getResignDate() != null) {
            // 历史离职档案可以暂时保留空日期，但一旦显式修改日期仍不能写入未来值。
            validateImmediateResignDate(employee, employee.getResignDate(), persistedHireDate);
        }
        LambdaUpdateWrapper<OrgEmployee> stateGuard = new LambdaUpdateWrapper<OrgEmployee>()
                .eq(OrgEmployee::getId, employee.getId());
        if (oldStatus == null) {
            stateGuard.isNull(OrgEmployee::getStatus);
        } else {
            stateGuard.eq(OrgEmployee::getStatus, oldStatus);
        }
        if (employeeMapper.update(employee, stateGuard) <= 0) {
            throw new BusinessException("员工状态已变化，请刷新后重试");
        }
        clearRemovedAttachments(dto);
        InitialCredentialVO initialCredential = syncEmployeeAccount(employee, dto, becameResigned);
        // 同步系统角色(dto.roleIds 非 null 时全量替换,无账号则跳过)
        syncEmployeeRoles(dto, employee);
        if (Integer.valueOf(3).equals(employee.getStatus())) {
            // 同一请求可能由超级管理员调整账号关联；历史离职编辑也必须让旧、新关联账号失败收紧。
            java.util.stream.Stream.of(oldUserId, employee.getUserId())
                    .filter(Objects::nonNull)
                    .distinct()
                    .forEach(sysUserService::disableForResignation);
        }
        return initialCredential;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void resignEmployee(Long employeeId, EmployeeResignDTO dto) {
        OrgEmployee employee = requireEmployee(employeeId);
        validateImmediateResignDate(employee, dto == null ? null : dto.getResignDate());
        if (Integer.valueOf(3).equals(employee.getStatus())) {
            if (!Objects.equals(employee.getResignDate(), dto.getResignDate())) {
                throw new BusinessException("员工已离职且日期已变化，请到离职中心核实后更正");
            }
            // 同日期重试保持幂等，但仍再次清理异常残留会话。
            sysUserService.disableForResignation(employee.getUserId());
            return;
        }
        if (!Integer.valueOf(1).equals(employee.getStatus())
                && !Integer.valueOf(2).equals(employee.getStatus())) {
            throw new BusinessException("仅在职或试用员工可以办理离职");
        }
        OrgEmployee patch = new OrgEmployee();
        patch.setStatus(3);
        patch.setResignDate(dto.getResignDate());
        if (employeeMapper.update(patch, new LambdaUpdateWrapper<OrgEmployee>()
                .eq(OrgEmployee::getId, employeeId)
                .in(OrgEmployee::getStatus, 1, 2)) <= 0) {
            throw new BusinessException("员工状态已变化，请刷新后重试");
        }
        employee.setStatus(3);
        employee.setResignDate(dto.getResignDate());
        // 即使账号原本已停用也再次精准作废，清除异常残留会话。
        sysUserService.disableForResignation(employee.getUserId());
    }

    private void validateImmediateResignDate(OrgEmployee employee, LocalDate resignDate) {
        validateImmediateResignDate(employee, resignDate, null);
    }

    private void validateImmediateResignDate(OrgEmployee employee, LocalDate resignDate,
                                             LocalDate persistedHireDate) {
        if (resignDate == null) {
            throw new BusinessException("离职日期不能为空");
        }
        if (resignDate.isAfter(LocalDate.now())) {
            throw new BusinessException("暂不支持预约未来离职");
        }
        if (employee != null && employee.getHireDate() != null
                && resignDate.isBefore(employee.getHireDate())) {
            throw new BusinessException("离职日期不能早于入职日期");
        }
        // 通用编辑会先把 DTO 复制到实体；同时对比复制前的持久化入职日，
        // 防止省略/同请求篡改 hireDate 绕过专用离职日期约束。
        if (persistedHireDate != null && resignDate.isBefore(persistedHireDate)) {
            throw new BusinessException("离职日期不能早于原入职日期，如入职日期有误请先单独更正档案");
        }
    }

    /**
     * 档案附件被“移除”时,前端会把对应 fileId 传成 null;但 updateById 会跳过 null 字段,
     * 旧的 fileId/fileName 在库里清不掉（与 syncUserAvatar 里旧头像的处理同源问题）。
     * 这里对已置空的附件字段用 LambdaUpdateWrapper 强制置 null,连同文件名一并清除。
     */
    private void clearRemovedAttachments(EmployeeDTO dto) {
        LambdaUpdateWrapper<OrgEmployee> clear = new LambdaUpdateWrapper<OrgEmployee>()
                .eq(OrgEmployee::getId, dto.getId());
        boolean needClear = false;
        if (dto.getResumeFileId() == null) {
            clear.set(OrgEmployee::getResumeFileId, null).set(OrgEmployee::getResumeFileName, null);
            needClear = true;
        }
        if (dto.getEducationCertFileId() == null) {
            clear.set(OrgEmployee::getEducationCertFileId, null).set(OrgEmployee::getEducationCertFileName, null);
            needClear = true;
        }
        if (dto.getSkillCertFileId() == null) {
            clear.set(OrgEmployee::getSkillCertFileId, null).set(OrgEmployee::getSkillCertFileName, null);
            needClear = true;
        }
        if (dto.getIdCardFrontFileId() == null) {
            clear.set(OrgEmployee::getIdCardFrontFileId, null).set(OrgEmployee::getIdCardFrontFileName, null);
            needClear = true;
        }
        if (dto.getIdCardBackFileId() == null) {
            clear.set(OrgEmployee::getIdCardBackFileId, null).set(OrgEmployee::getIdCardBackFileName, null);
            needClear = true;
        }
        if (needClear) {
            employeeMapper.update(null, clear);
        }
    }

    private String resolveEmpCodeForCreate(EmployeeDTO dto) {
        // 普通账号无权手动指定工号,新增时统一由后端生成;超级管理员可手填,不填也自动生成。
        if (isCurrentSuperAdmin() && StringUtils.hasText(dto.getEmpCode())) {
            return dto.getEmpCode().trim();
        }
        return generateNextEmpCode();
    }

    private String resolveEmpCodeForUpdate(EmployeeDTO dto, OrgEmployee oldEmployee) {
        // 非超级管理员不能改工号:即使前端参数被篡改,后端也保留旧工号。
        if (!isCurrentSuperAdmin()) {
            return oldEmployee.getEmpCode();
        }
        return StringUtils.hasText(dto.getEmpCode()) ? dto.getEmpCode().trim() : oldEmployee.getEmpCode();
    }

    private boolean isCurrentSuperAdmin() {
        return SecurityUtils.canManageTenantSuperAdmin();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteEmployee(Long id) {
        requireAccountSecurityManager();
        OrgEmployee employee = employeeMapper.selectById(id);
        if (employee == null) {
            return;
        }
        if (employee.getUserId() != null) {
            assertCanManageTargetAccount(employee.getUserId());
            setUserStatus(employee.getUserId(), 1);
        }
        employeeMapper.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public InitialCredentialVO resetEmployeePassword(Long employeeId) {
        requireAccountSecurityManager();
        OrgEmployee employee = requireEmployee(employeeId);
        if (employee.getUserId() == null) {
            throw new BusinessException("该员工尚未开通登录账号");
        }
        assertCanManageTargetAccount(employee.getUserId());
        return sysUserService.resetPassword(employee.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateEmployeeAccountStatus(Long employeeId, Boolean accountEnabled) {
        requireAccountSecurityManager();
        OrgEmployee employee = requireEmployee(employeeId);
        if (employee.getUserId() == null) {
            throw new BusinessException("该员工尚未开通登录账号");
        }
        if (Boolean.TRUE.equals(accountEnabled) && Integer.valueOf(3).equals(employee.getStatus())) {
            throw new BusinessException("离职员工不能启用登录，请先完成返聘并恢复在职状态");
        }
        assertCanManageTargetAccount(employee.getUserId());
        setUserStatus(employee.getUserId(), Boolean.FALSE.equals(accountEnabled) ? 1 : 0);
    }

    private InitialCredentialVO syncEmployeeAccount(OrgEmployee employee, EmployeeDTO dto,
                                                     boolean resignationInvalidationPending) {
        if (employee.getUserId() == null && !shouldCreateAccount(dto)) {
            return null;
        }

        SysUser user = employee.getUserId() == null ? null : userMapper.selectById(employee.getUserId());
        if (user == null) {
            String initialPassword = PasswordPolicy.generateInitialPassword();
            user = createAccount(employee, dto, initialPassword);
            employee.setUserId(user.getId());
            if (employeeMapper.updateById(employee) <= 0) {
                throw new BusinessException("员工账号关联失败");
            }
            return new InitialCredentialVO(user.getUsername(), initialPassword, true);
        }

        updateAccount(user, employee, dto, resignationInvalidationPending);
        return null;
    }

    private SysUser createAccount(OrgEmployee employee, EmployeeDTO dto, String initialPassword) {
        String username = pickUsername(employee, dto);
        if (!StringUtils.hasText(username)) {
            throw new BusinessException("开通登录账号时必须填写手机号、工号或登录账号");
        }
        assertUsernameUnique(username, null);

        SysUser user = new SysUser();
        user.setUsername(username);
        user.setPassword(SecurityUtils.encryptPassword(initialPassword));
        user.setMustChangePassword(1);
        user.setPasswordChangedAt(null);
        user.setMfaEnabled(0);
        user.setMfaSecret(null);
        user.setMfaEnrolledAt(null);
        fillUserFromEmployee(user, employee);
        user.setStatus(resolveUserStatus(employee, dto));
        if (userMapper.insert(user) <= 0) {
            throw new BusinessException("员工登录账号创建失败");
        }
        return user;
    }

    private void updateAccount(SysUser user, OrgEmployee employee, EmployeeDTO dto,
                               boolean resignationInvalidationPending) {
        boolean accountSecurityManager = canManageAccountSecurity();
        Integer desiredStatus = accountSecurityManager ? resolveUserStatus(employee, dto) : null;
        boolean privilegedAccountSecurityChanged = accountSecurityManager && (
                (StringUtils.hasText(dto.getUsername()) && !Objects.equals(user.getUsername(), dto.getUsername()))
                        || (desiredStatus != null && !Objects.equals(user.getStatus(), desiredStatus)));
        // 部门直接参与数据范围计算。HR 可以正常办理调岗，但旧登录态必须同步失效。
        boolean departmentChanged = !Objects.equals(user.getDeptId(), employee.getDeptId());
        boolean authContextChanged = privilegedAccountSecurityChanged || departmentChanged;
        // HR 可调动普通员工；若目标本身是老板/系统管理员，仍沿用 P0 的特权账号保护，
        // 防止借“调部门”改变其数据范围。只有平台管理员可维护特权账号的安全上下文。
        if (privilegedAccountSecurityChanged || departmentChanged) {
            assertCanManageTargetAccount(user.getId());
        }
        if (StringUtils.hasText(dto.getUsername()) && !Objects.equals(user.getUsername(), dto.getUsername())) {
            assertUsernameUnique(dto.getUsername(), user.getId());
            user.setUsername(dto.getUsername());
        }
        fillUserFromEmployee(user, employee);
        // 超级管理员仍可显式启停普通员工账号；离职联动在本事务末尾统一失败收紧。
        if (accountSecurityManager) {
            if (desiredStatus != null) {
                user.setStatus(desiredStatus);
            }
        }
        if (userMapper.updateById(user) <= 0) {
            throw new BusinessException("登录账号不存在或无权修改");
        }
        if (authContextChanged && !resignationInvalidationPending) {
            tokenService.invalidateLoginUserSafely(user.getId());
        }
    }

    /** 保留给既有账号同步契约测试；生产调用会显式传入是否等待离职失效。 */
    private void updateAccount(SysUser user, OrgEmployee employee, EmployeeDTO dto) {
        updateAccount(user, employee, dto, false);
    }

    /**
     * 账号安全字段仅真实登录的超级管理员可修改。
     * HR 表单为兼容旧页面可仍携带这些字段，后端统一忽略，避免角色提权、密码重置或账号停用。
     */
    private void clearUnauthorizedAccountSecurityFields(EmployeeDTO dto) {
        if (canManageAccountSecurity()) {
            return;
        }
        dto.setUserId(null);
        dto.setUsername(null);
        dto.setAccountEnabled(null);
        dto.setRoleIds(null);
    }

    /**
     * 同步员工系统角色(全量替换)。
     * <p>语义:dto.getRoleIds() == null 表示前端没改角色(保持不变);非 null 表示全量替换关联。
     * 该方法必须只在 employee 已绑定了 userId(userId != null)时调用。</p>
     */
    private void syncEmployeeRoles(EmployeeDTO dto, OrgEmployee employee) {
        if (dto == null || dto.getRoleIds() == null) {
            return;
        }
        Long userId = employee.getUserId();
        if (userId == null) {
            return; // 未开通登录账号,无可同步角色
        }
        java.util.List<Long> roleIds = dto.getRoleIds();
        roleMapper.deleteUserRoles(userId);
        if (roleIds != null && !roleIds.isEmpty()) {
            roleMapper.insertUserRoles(userId, roleIds);
        }
    }

    private boolean canManageAccountSecurity() {
        return SecurityUtils.canManageTenantSuperAdmin();
    }

    private void requireAccountSecurityManager() {
        if (!canManageAccountSecurity()) {
            throw new BusinessException("仅超级管理员可修改员工登录账号安全设置");
        }
    }

    private void fillUserFromEmployee(SysUser user, OrgEmployee employee) {
        user.setNickname(employee.getName());
        user.setPhone(employee.getPhone());
        user.setEmail(employee.getEmail());
        user.setGender(employee.getGender());
        syncUserAvatar(user, employee.getAvatar());
        user.setDeptId(employee.getDeptId());
        user.setRemark(employee.getRemark());
    }

    private void syncUserAvatar(SysUser user, String employeeAvatar) {
        if (!StringUtils.hasText(employeeAvatar)) {
            user.setAvatar(null);
            // updateById 会跳过 null 字段,旧头像清不掉;对已持久化用户用 wrapper 强制置空。
            if (user.getId() != null) {
                userMapper.update(null, new LambdaUpdateWrapper<SysUser>()
                        .eq(SysUser::getId, user.getId())
                        .set(SysUser::getAvatar, null));
            }
            return;
        }
        String avatar = employeeAvatar.trim();
        // 员工照片字段允许保存压缩后的 base64 大图;登录账号头像字段是 varchar(500),只适合同步短 URL。
        if (!avatar.startsWith("data:") && avatar.length() <= 500) {
            user.setAvatar(avatar);
        }
    }

    private boolean shouldCreateAccount(EmployeeDTO dto) {
        return Boolean.TRUE.equals(dto.getAccountEnabled())
                || StringUtils.hasText(dto.getUsername());
    }

    private String pickUsername(OrgEmployee employee, EmployeeDTO dto) {
        if (StringUtils.hasText(dto.getUsername())) {
            return dto.getUsername().trim();
        }
        if (StringUtils.hasText(employee.getPhone())) {
            return employee.getPhone().trim();
        }
        return employee.getEmpCode();
    }

    private Integer resolveUserStatus(OrgEmployee employee, EmployeeDTO dto) {
        if (employee.getStatus() != null && employee.getStatus() == 3) {
            return 1;
        }
        if (dto.getAccountEnabled() == null) {
            return employee.getUserId() == null ? 0 : null;
        }
        return Boolean.TRUE.equals(dto.getAccountEnabled()) ? 0 : 1;
    }

    private void assertUsernameUnique(String username, Long excludeUserId) {
        long count = userMapper.selectCount(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUsername, username)
                .ne(excludeUserId != null, SysUser::getId, excludeUserId));
        if (count > 0) {
            throw new BusinessException("登录账号已存在");
        }
    }

    private void assertCanManageTargetAccount(Long userId) {
        if (isPlatformAccount()) {
            return;
        }
        if (Long.valueOf(1L).equals(userId)) {
            throw new AccessDeniedException("仅平台管理员可维护平台账号");
        }
        List<String> roleKeys = userMapper.selectRoleKeysByUserId(userId);
        if (roleKeys != null && roleKeys.stream().anyMatch(this::isPrivilegedRoleKey)
                && !canManageAccountSecurity()) {
            throw new AccessDeniedException("仅超级管理员可维护特权账号");
        }
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

    private void enrichEmployeeAccounts(List<EmployeeVO> records) {
        if (CollectionUtils.isEmpty(records)) {
            return;
        }
        // 批量富化,消除N+1:收集userId → 一次查账号 + 一次批量查角色关联 + 一次查角色名 → 内存赋值
        List<Long> userIds = records.stream()
                .map(EmployeeVO::getUserId).filter(Objects::nonNull).distinct()
                .collect(Collectors.toList());
        if (userIds.isEmpty()) {
            return;
        }
        java.util.Map<Long, SysUser> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(SysUser::getId, u -> u, (a, b) -> a));
        java.util.Map<Long, List<Long>> userRoleIds = new java.util.HashMap<>();
        for (java.util.Map<String, Object> row : userMapper.selectUserRoleMappings(userIds)) {
            Object uid = row.get("userId");
            Object rid = row.get("roleId");
            if (uid != null && rid != null) {
                userRoleIds.computeIfAbsent(((Number) uid).longValue(), k -> new java.util.ArrayList<>())
                        .add(((Number) rid).longValue());
            }
        }
        List<Long> allRoleIds = userRoleIds.values().stream()
                .flatMap(List::stream).distinct().collect(Collectors.toList());
        java.util.Map<Long, String> roleNameMap = allRoleIds.isEmpty() ? Collections.emptyMap()
                : roleMapper.selectBatchIds(allRoleIds).stream()
                        .collect(Collectors.toMap(SysRole::getId, SysRole::getRoleName, (a, b) -> a));
        for (EmployeeVO vo : records) {
            if (vo.getUserId() == null) {
                continue;
            }
            SysUser user = userMap.get(vo.getUserId());
            if (user == null) {
                continue;
            }
            vo.setUsername(user.getUsername());
            vo.setUserStatus(user.getStatus());
            vo.setAccountEnabled(user.getStatus() == null || user.getStatus() == 0);
            List<Long> roleIds = userRoleIds.getOrDefault(vo.getUserId(), Collections.emptyList());
            vo.setRoleIds(roleIds);
            vo.setRoleNames(roleIds.stream().map(roleNameMap::get)
                    .filter(Objects::nonNull).collect(Collectors.toList()));
        }
    }

    private void enrichEmployeeAccount(EmployeeVO vo) {
        if (vo == null || vo.getUserId() == null) {
            return;
        }
        SysUser user = userMapper.selectById(vo.getUserId());
        if (user == null) {
            return;
        }
        vo.setUsername(user.getUsername());
        vo.setUserStatus(user.getStatus());
        vo.setAccountEnabled(user.getStatus() == null || user.getStatus() == 0);
        List<Long> roleIds = userMapper.selectRoleIdsByUserId(user.getId());
        vo.setRoleIds(roleIds == null ? Collections.emptyList() : roleIds);
        if (CollectionUtils.isEmpty(roleIds)) {
            vo.setRoleNames(Collections.emptyList());
            return;
        }
        vo.setRoleNames(roleMapper.selectBatchIds(roleIds).stream()
                .map(SysRole::getRoleName)
                .collect(Collectors.toList()));
    }

    private OrgEmployee requireEmployee(Long employeeId) {
        OrgEmployee employee = employeeMapper.selectById(employeeId);
        if (employee == null) {
            throw new BusinessException("员工不存在");
        }
        return employee;
    }

    private void setUserStatus(Long userId, Integer status) {
        SysUser user = new SysUser();
        user.setId(userId);
        user.setStatus(status);
        if (userMapper.updateById(user) <= 0) {
            throw new BusinessException("登录账号不存在或无权修改");
        }
        tokenService.invalidateLoginUserSafely(userId);
    }
}
