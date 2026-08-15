-- 工作日报(个人日报):驾驶舱首页"工作日报"原前端 localStorage,改后端单表持久化
CREATE TABLE IF NOT EXISTS daily_report (
    id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '自增ID',
    report_date  DATE         NOT NULL COMMENT '日报日期',
    today_work   VARCHAR(2000)         COMMENT '今日工作',
    tomorrow_plan VARCHAR(2000)        COMMENT '明日计划',
    user_id      BIGINT                COMMENT '所属用户',
    create_time  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    create_by    BIGINT                COMMENT '创建人',
    update_by    BIGINT                COMMENT '更新人',
    deleted      TINYINT      DEFAULT 0 COMMENT '逻辑删除 0否1是',
    tenant_id    BIGINT       DEFAULT 1 COMMENT '租户',
    PRIMARY KEY (id),
    KEY idx_dr_tenant_user_date (tenant_id, user_id, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作日报';
