package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 微信消息数日统计(从云客 salesWechatStatisticsDetails 聚合):
 * 员工微信列表显示发送/接收消息条数。按 (wechatId, ymd) 唯一,页面按时间段 sum。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_wechat_msg_stat")
public class BizWechatMsgStat extends BaseEntity {
    /** 员工微信号 */
    private String wechatId;
    /** 日期 yyyy-MM-dd */
    private String ymd;
    /** 发送消息数 */
    private Integer sendCount;
    /** 接收消息数 */
    private Integer recvCount;
}
