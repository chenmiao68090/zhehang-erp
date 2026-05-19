package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.dto.UserDTO;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.vo.UserVO;

public interface ISysUserService extends IService<SysUser> {
    IPage<UserVO> selectUserPage(int pageNum, int pageSize, String username, String phone, Integer status);
    UserVO selectUserById(Long userId);
    void createUser(UserDTO dto);
    void updateUser(UserDTO dto);
    void deleteUser(Long userId);
    void resetPassword(Long userId, String newPassword);
    void updateStatus(Long userId, Integer status);
}