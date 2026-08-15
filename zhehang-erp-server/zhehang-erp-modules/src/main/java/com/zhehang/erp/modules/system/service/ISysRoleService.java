package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.dto.RolePermissionSettingsDTO;
import com.zhehang.erp.modules.system.domain.entity.SysRole;

import java.util.List;
import java.util.Map;

public interface ISysRoleService extends IService<SysRole> {
    IPage<SysRole> selectRolePage(int pageNum, int pageSize, String roleName, String roleKey, Integer status);
    SysRole getRoleDetail(Long roleId);
    void createRole(RoleDTO dto);
    void updateRole(RoleDTO dto);
    void deleteRole(Long roleId);
    /** 角色管理唯一写入口：原子更新数据范围、可见模块与页面/按钮/API 权限。 */
    void updatePermissionSettings(RolePermissionSettingsDTO dto);

    /** 汇总给定角色的可见模块并集;任一角色未配置(空)则视为不限制,返回 null */
    List<String> resolveVisibleModules(List<String> roleKeys);

    /** 查角色下的成员列表 */
    List<Map<String, Object>> listRoleMembers(Long roleId);

    /** 候选员工列表(挑人加入角色用) */
    List<Map<String, Object>> listMemberCandidates(String keyword);

    /** 批量把用户加入角色(幂等),返回实际新增条数 */
    int addRoleMembers(Long roleId, List<Long> userIds);

    /** 把某用户移出角色 */
    void removeRoleMember(Long roleId, Long userId);
}
