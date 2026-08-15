package com.zhehang.erp.modules.crm.support;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 数据权限助手:按当前登录用户的数据范围(data_scope)给查询追加归属过滤。
 *
 * <p>data_scope 取值: 1全部 / 2自定义 / 3本部门 / 4本部门及以下 / 5本人。
 * 本期仅支持 1/3/4/5;2(自定义)缺 sys_role_dept 表,暂按"本人"兜底(失败收紧,不放权)。</p>
 *
 * <p>设计为 Service 层显式调用(而非 RuoYi 式注解+XML字符串拼接),
 * 契合本项目"MyBatis-Plus + LambdaQueryWrapper、无自定义 XML"的范式,且无 SQL 注入风险。</p>
 */
@Component
@RequiredArgsConstructor
public class DataScopeHelper {

    private final SysDeptMapper deptMapper;
    private final SysUserMapper userMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;

    /**
     * 给查询条件追加数据权限过滤。
     *
     * @param wrapper      待追加条件的查询包装器
     * @param ownerColumn  归属人列(如 CrmLead::getOwnerId)
     * @param deptColumn   归属部门列(如 CrmLead::getDeptId)
     */
    public <T> void apply(LambdaQueryWrapper<T> wrapper,
                          SFunction<T, ?> ownerColumn,
                          SFunction<T, ?> deptColumn) {
        if (SecurityUtils.isCurrentAdmin()) {
            return; // 管理员:看全部,不加任何限制
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        Long deptId = SecurityUtils.getCurrentDeptId();
        Long userId = SecurityUtils.getCurrentUserId();

        if (scope != null && scope == 1) {
            return; // 全部
        }
        if (deptId != null && scope != null && scope == 3) {
            List<Long> visibleUserIds = getVisibleUserIds();
            wrapper.and(w -> w
                    .in(visibleUserIds != null && !visibleUserIds.isEmpty(), ownerColumn, visibleUserIds)
                    .or(x -> x.isNull(ownerColumn).eq(deptColumn, deptId)));
            // 有负责人时以人员当前部门为准;无负责人时才按记录部门兜底。
            return;
        }
        if (deptId != null && scope != null && scope == 4) {
            List<Long> deptIds = listSelfAndChildren(deptId);
            List<Long> visibleUserIds = getVisibleUserIds();
            wrapper.and(w -> w
                    .in(visibleUserIds != null && !visibleUserIds.isEmpty(), ownerColumn, visibleUserIds)
                    .or(x -> x.isNull(ownerColumn).in(deptColumn, deptIds)));
            // 有负责人时以人员当前部门为准;无负责人时才按记录部门兜底。
            return;
        }
        // 默认(5本人 / 2自定义未支持 / 部门缺失):仅本人,失败收紧
        wrapper.eq(ownerColumn, userId);
    }

    /**
     * 财务类业务表(订单/合同/收款/提成)的数据范围过滤。
     * 规则与通用 apply 一致:管理员 或 data_scope=1(财务部 finance_hq 角色 / 老板) → 看全部;
     * 部门主管(3/4) → 本部门(及以下);其余(销售/会计/管家/员工,data_scope=5) → 仅本人。
     * 注:只有「财务部」成员(finance_hq角色,data_scope=1)能看全部财务,用于对账/确认/核发;
     * 做账会计、地址/财务管家虽是finance角色但data_scope=5,只看本人(符合老板要求)。
     */
    public <T> void applyFinancial(LambdaQueryWrapper<T> wrapper,
                                   SFunction<T, ?> ownerColumn,
                                   SFunction<T, ?> deptColumn) {
        apply(wrapper, ownerColumn, deptColumn);
    }

    /**
     * 判断当前登录用户能否访问"归属人=ownerId、归属部门=deptId"的一条记录(与 apply 同口径)。
     * 用于单条操作(如给某线索写跟进)的越权校验。
     */
    public boolean canAccess(Long ownerId, Long deptId) {
        if (SecurityUtils.isCurrentAdmin()) {
            return true;
        }
        Long uid = SecurityUtils.getCurrentUserId();
        if (uid != null && uid.equals(ownerId)) {
            return true; // 本人归属优先,避免人员调部门后被旧 dept_id 错误拦截
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        if (scope != null && scope == 1) {
            return true; // 全部
        }
        if (ownerId != null) {
            return canAccessOwner(ownerId); // 有负责人时仅按人员当前部门判断,避免旧部门继续越权
        }
        Long myDept = SecurityUtils.getCurrentDeptId();
        if (myDept != null && deptId != null && scope != null && scope == 3) {
            return myDept.equals(deptId); // 仅本部门
        }
        if (myDept != null && deptId != null && scope != null && scope == 4) {
            return listSelfAndChildren(myDept).contains(deptId); // 本部门及以下
        }
        // 默认仅本人
        return uid != null && uid.equals(ownerId);
    }

    /**
     * 按"创建人"的数据范围(供应链/渠道等无明确归属人的敏感数据):
     * 管理员 或 data_scope=1 → 看全部;其余 → 只看自己创建的(create_by=当前用户)。
     * 用于供应商(银行账号)/采购(单价)/地址资源(利润)/渠道成本 等敏感列表的最小收敛。
     */
    public <T> void applyCreatorScope(LambdaQueryWrapper<T> wrapper, SFunction<T, ?> createByColumn) {
        if (SecurityUtils.isCurrentAdmin()) {
            return;
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        if (scope != null && scope == 1) {
            return;
        }
        wrapper.eq(createByColumn, SecurityUtils.getCurrentUserId());
    }

    /**
     * 按"本人员工"的数据范围(提成等以 employee_id 归属的敏感数据):
     * 管理员 或 data_scope=1(财务部/老板) → 看全部;其余 → 只看自己(employee_id=本人档案;无档案则查不到)。
     * 与 {@link #applyCreatorScope} 同款门控,但按员工归属而非创建人收敛。
     */
    public <T> void applyOwnEmployeeScope(LambdaQueryWrapper<T> wrapper, SFunction<T, ?> employeeIdColumn) {
        if (SecurityUtils.isCurrentAdmin()) {
            return;
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        if (scope != null && scope == 1) {
            return;
        }
        Long myEmp = currentEmployeeId();
        wrapper.eq(employeeIdColumn, myEmp != null ? myEmp : -1L);
    }

    /** 是否人事或管理员(可看全部HR敏感数据:薪资/绩效/员工档案/简历) */
    public boolean isHrOrAdmin() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("hr");
    }

    /** 是否人事/管理员/老板(可管理薪酬、薪酬模板、假期类型等HR敏感配置;比 isHrOrAdmin 多含老板boss,避免把老板挡在薪酬模块外) */
    public boolean isHrAdminOrBoss() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("hr", "boss");
    }

    /** 是否管理层/管理员:可做审批、签署、终止、改状态等把关动作。当前真实角色=super_admin(isAdmin)+dept_manager;含boss/manager以兼容未来角色。 */
    public boolean isManagerOrAdmin() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("dept_manager", "manager", "boss");
    }

    /** 当前登录用户对应的员工档案ID(经 org_employee.user_id 映射);无则 null */
    public Long currentEmployeeId() {
        Long uid = SecurityUtils.getCurrentUserId();
        if (uid == null) {
            return null;
        }
        OrgEmployee emp = orgEmployeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                .select(OrgEmployee::getId).eq(OrgEmployee::getUserId, uid).last("LIMIT 1"));
        return emp == null ? null : emp.getId();
    }

    /** 查某用户所属部门ID(分配/转化时给新归属记录写 dept_id 用) */
    public Long deptIdOfUser(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        return user == null ? null : user.getDeptId();
    }

    /** 本部门及其所有子部门的ID集合(公开版,供其它模块按部门过滤,如交付任务) */
    public List<Long> deptSelfAndChildren(Long deptId) {
        return listSelfAndChildren(deptId);
    }

    /**
     * 当前登录用户"可见的员工用户ID集合"。用于**没有 dept_id 列**的业务表
     * (通话记录/代账报单/跟进/提成)按"归属人 IN (...)"过滤,避免为每张表都补 dept_id。
     * 返回 null 表示"不限"(老板/超管/data_scope=1),调用方不应追加过滤。
     * 主管(3/4) → 本部门(及下级)所有员工ID;其余 → 仅本人(失败收紧)。
     */
    public List<Long> getVisibleUserIds() {
        if (SecurityUtils.isCurrentAdmin()) {
            return null;
        }
        Integer scope = SecurityUtils.getCurrentDataScope();
        Long userId = SecurityUtils.getCurrentUserId();
        if (scope != null && scope == 1) {
            return null;
        }
        Long deptId = SecurityUtils.getCurrentDeptId();
        if (deptId != null && scope != null && (scope == 3 || scope == 4)) {
            List<Long> deptIds = (scope == 4) ? listSelfAndChildren(deptId) : java.util.Collections.singletonList(deptId);
            List<Long> ids = userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                            .select(SysUser::getId).in(SysUser::getDeptId, deptIds))
                    .stream().map(SysUser::getId).collect(Collectors.toList());
            if (userId != null && !ids.contains(userId)) {
                ids.add(userId);
            }
            return ids.isEmpty() ? java.util.Collections.singletonList(userId == null ? -1L : userId) : ids;
        }
        return java.util.Collections.singletonList(userId == null ? -1L : userId);
    }

    /**
     * 按"归属人"的可见用户ID集过滤(用于无 dept_id 的表:通话/代账/跟进/提成)。
     * 老板/超管 → 不加限制;主管 → 归属人 IN 本部门及下级员工;员工 → 归属人=自己(即使前端传别人ID也会被此收紧)。
     */
    public <T> void applyByVisibleUsers(LambdaQueryWrapper<T> wrapper, SFunction<T, ?> ownerColumn) {
        List<Long> ids = getVisibleUserIds();
        if (ids == null) {
            return;
        }
        wrapper.in(ownerColumn, ids);
    }

    /** 单条越权校验(无 dept_id 表):当前用户能否访问"归属人=ownerId"的记录,与 applyByVisibleUsers 同口径 */
    public boolean canAccessOwner(Long ownerId) {
        List<Long> ids = getVisibleUserIds();
        return ids == null || (ownerId != null && ids.contains(ownerId));
    }

    /** 批量把用户ID解析成显示名(nickname 优先、回退 username);用于列表回显"负责人"姓名,与角色权限无关 */
    public java.util.Map<Long, String> resolveUserNames(java.util.Collection<Long> userIds) {
        java.util.Map<Long, String> map = new java.util.HashMap<>();
        if (userIds == null || userIds.isEmpty()) {
            return map;
        }
        List<Long> ids = userIds.stream().filter(java.util.Objects::nonNull).distinct().collect(Collectors.toList());
        if (ids.isEmpty()) {
            return map;
        }
        userMapper.selectList(new LambdaQueryWrapper<SysUser>()
                        .select(SysUser::getId, SysUser::getNickname, SysUser::getUsername)
                        .in(SysUser::getId, ids))
                .forEach(u -> map.put(u.getId(),
                        (u.getNickname() != null && !u.getNickname().isEmpty()) ? u.getNickname() : u.getUsername()));
        return map;
    }

    /** 本部门及其所有子部门的ID集合(基于 sys_dept.ancestors);至少含自身 */
    private List<Long> listSelfAndChildren(Long deptId) {
        List<SysDept> list = deptMapper.selectList(
                new LambdaQueryWrapper<SysDept>()
                        .select(SysDept::getId)
                        .and(w -> w.eq(SysDept::getId, deptId)
                                .or()
                                .apply("FIND_IN_SET({0}, ancestors) > 0", deptId)));
        List<Long> ids = list.stream().map(SysDept::getId).collect(Collectors.toList());
        if (ids.isEmpty()) {
            ids = new ArrayList<>();
            ids.add(deptId);
        }
        return ids;
    }
}
