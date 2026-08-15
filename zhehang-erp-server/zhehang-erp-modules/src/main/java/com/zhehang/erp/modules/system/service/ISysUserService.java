package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;
import com.zhehang.erp.modules.system.domain.vo.UserVO;

public interface ISysUserService extends IService<SysUser> {
    IPage<UserVO> selectUserPage(int pageNum, int pageSize, String username, String phone, Integer status);
    UserVO selectUserById(Long userId);
    InitialCredentialVO createUser(UserDTO dto);
    void updateUser(UserDTO dto);
    void deleteUser(Long userId);
    InitialCredentialVO resetPassword(Long userId);
    /** 当前登录用户自助修改密码(校验原密码) */
    void updateMyPassword(String oldPassword, String newPassword);
    /** 首次登录预认证阶段改密；成功后所有历史登录态失效。 */
    void updateInitialPassword(Long userId, String newPassword);
    /** 清除MFA绑定；目标账号下次登录时按角色策略重新开通。 */
    void resetMfa(Long userId);
    void updateStatus(Long userId, Integer status);
    /** 人事离职联动专用：停用账号并立即精准作废该用户全部旧会话。 */
    void disableForResignation(Long userId);
}
