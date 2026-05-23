-- sys_notification table
CREATE TABLE IF NOT EXISTS sys_notification (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT COMMENT '通知内容',
    type VARCHAR(20) NOT NULL DEFAULT 'system' COMMENT '类型: system/approval/task/message',
    is_read TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    sender VARCHAR(50) COMMENT '发送者',
    link VARCHAR(255) COMMENT '关联链接',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    create_by BIGINT,
    update_by BIGINT,
    deleted TINYINT DEFAULT 0,
    tenant_id BIGINT,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统通知表';

-- Insert sample notification data
INSERT INTO sys_notification (id, title, content, type, is_read, user_id, sender) VALUES
(1, '系统升级维护通知', 'ERP系统将于5月20日凌晨2:00-5:00进行版本升级，届时系统暂停服务。', 'system', 0, 1, '系统管理员'),
(2, '报销审批待处理', '张三提交的差旅报销申请（¥3,200）等待您审批。', 'approval', 0, 1, '张三'),
(3, '合同到期提醒', '杭州科技有限公司服务合同将于2026-06-01到期，请及时跟进续签。', 'task', 0, 1, '系统'),
(4, '新客户分配通知', '系统已将新线索"宁波精密制造有限公司"分配给您，请尽快联系。', 'message', 0, 1, '系统'),
(5, '端午节放假通知', '2026年端午节5月28日至30日放假调休，共3天。', 'system', 1, 1, '行政部');
