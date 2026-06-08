package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    List<String> selectPermsByUserId(@Param("userId") Long userId);
    List<String> selectRoleKeysByUserId(@Param("userId") Long userId);
    List<Long> selectRoleIdsByUserId(@Param("userId") Long userId);
    Long selectFirstUserIdByRoleKey(@Param("roleKey") String roleKey);

    /** 该用户所有有效角色里数值最小的 data_scope(=范围最大);无角色时返回 null */
    Integer selectMinDataScopeByUserId(@Param("userId") Long userId);
}
