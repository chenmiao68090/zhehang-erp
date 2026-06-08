package com.zhehang.erp.modules.crm.support;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
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
            wrapper.eq(deptColumn, deptId); // 仅本部门
            return;
        }
        if (deptId != null && scope != null && scope == 4) {
            wrapper.in(deptColumn, listSelfAndChildren(deptId)); // 本部门及以下
            return;
        }
        // 默认(5本人 / 2自定义未支持 / 部门缺失):仅本人,失败收紧
        wrapper.eq(ownerColumn, userId);
    }

    /** 查某用户所属部门ID(分配/转化时给新归属记录写 dept_id 用) */
    public Long deptIdOfUser(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        return user == null ? null : user.getDeptId();
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
