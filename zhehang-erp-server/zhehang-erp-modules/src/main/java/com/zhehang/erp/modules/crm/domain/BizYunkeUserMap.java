package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 云客员工账号映射:系统员工 ↔ 云客账号,供「点击拨打」用其云客用户ID作外呼 partnerId。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_yunke_user_map")
public class BizYunkeUserMap extends BaseEntity {
    /** 系统用户ID(sys_user.id) */
    private Long userId;
    /** 系统员工姓名 */
    private String userName;
    /** 系统员工手机号 */
    private String userPhone;
    /** 云客用户ID(外呼 partnerId 用) */
    private String yunkeUserId;
    /** 云客员工微信ID */
    private String yunkeWechatId;
    /** 云客账号绑定手机号 */
    private String yunkePhone;
    /** 云客微信昵称 */
    private String yunkeNickname;
}
