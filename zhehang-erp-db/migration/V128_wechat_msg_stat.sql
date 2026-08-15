-- 云客微信消息数日统计:salesWechatStatisticsDetails 逐好友逐天,按(微信号,日期)聚合落库;
-- 员工微信列表按时间段 sum(send/recv) 显示消息条数。后台定时同步,页面查库不拖慢。
CREATE TABLE IF NOT EXISTS biz_wechat_msg_stat (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    wechat_id VARCHAR(64) NOT NULL COMMENT '员工微信号',
    ymd VARCHAR(10) NOT NULL COMMENT '日期 yyyy-MM-dd',
    send_count INT DEFAULT 0 COMMENT '发送消息数',
    recv_count INT DEFAULT 0 COMMENT '接收消息数',
    create_by VARCHAR(64) DEFAULT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_by VARCHAR(64) DEFAULT NULL,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0 COMMENT '逻辑删除',
    tenant_id BIGINT DEFAULT NULL COMMENT '租户',
    PRIMARY KEY (id),
    UNIQUE KEY uk_wx_ymd (wechat_id, ymd)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云客微信消息数日统计';
