CREATE TABLE IF NOT EXISTS biz_task_progress_report (
  id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  task_id BIGINT NOT NULL COMMENT '任务ID',
  reporter_id BIGINT DEFAULT NULL COMMENT '汇报人用户ID',
  reporter_name VARCHAR(64) DEFAULT NULL COMMENT '汇报人姓名',
  content TEXT NOT NULL COMMENT '汇报内容',
  report_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '汇报时间',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by BIGINT DEFAULT NULL COMMENT '创建人',
  update_by BIGINT DEFAULT NULL COMMENT '更新人',
  deleted TINYINT DEFAULT 0 COMMENT '删除标志',
  tenant_id BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (id),
  KEY idx_task_report_task (task_id),
  KEY idx_task_report_time (report_time),
  KEY idx_task_report_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务进度汇报';
