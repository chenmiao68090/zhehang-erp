package com.zhehang.erp.modules.auth.oauth.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user_oauth")
public class SysUserOauth extends BaseEntity {

    /** 系统用户ID */
    private Long userId;

    /** 供应商 */
    private String provider;

    /** OpenID */
    private String openId;

    /** UnionID */
    private String unionId;

    /** 第三方昵称 */
    private String nickname;

    /** 第三方头像 */
    private String avatar;
}
