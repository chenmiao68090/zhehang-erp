SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =============================================
-- 第三方登录与开放API模块
-- =============================================

-- 第三方登录配置表
CREATE TABLE IF NOT EXISTS sys_oauth_config (
  id BIGINT NOT NULL COMMENT '主键ID',
  provider VARCHAR(50) NOT NULL COMMENT '供应商: wechat_work/dingtalk/feishu',
  app_id VARCHAR(200) DEFAULT NULL COMMENT '应用ID',
  app_secret VARCHAR(500) DEFAULT NULL COMMENT '应用密钥(AES加密存储)',
  agent_id VARCHAR(100) DEFAULT NULL COMMENT '代理ID/AgentId',
  redirect_uri VARCHAR(500) DEFAULT NULL COMMENT '回调地址',
  enabled TINYINT NOT NULL DEFAULT 0 COMMENT '是否启用: 0-禁用 1-启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by BIGINT DEFAULT NULL COMMENT '创建人',
  update_by BIGINT DEFAULT NULL COMMENT '更新人',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
  tenant_id BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (id),
  UNIQUE KEY uk_provider (provider, tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三方登录配置表';

-- 用户第三方账号绑定表
CREATE TABLE IF NOT EXISTS sys_user_oauth (
  id BIGINT NOT NULL COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '系统用户ID',
  provider VARCHAR(50) NOT NULL COMMENT '供应商: wechat_work/dingtalk/feishu',
  open_id VARCHAR(200) DEFAULT NULL COMMENT '第三方OpenID',
  union_id VARCHAR(200) DEFAULT NULL COMMENT '第三方UnionID',
  nickname VARCHAR(200) DEFAULT NULL COMMENT '第三方昵称',
  avatar VARCHAR(500) DEFAULT NULL COMMENT '第三方头像',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by BIGINT DEFAULT NULL COMMENT '创建人',
  update_by BIGINT DEFAULT NULL COMMENT '更新人',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
  tenant_id BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_provider (user_id, provider),
  KEY idx_open_id (provider, open_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户第三方账号绑定表';

-- 开放API应用表
CREATE TABLE IF NOT EXISTS openapi_app (
  id BIGINT NOT NULL COMMENT '主键ID',
  app_name VARCHAR(200) NOT NULL COMMENT '应用名称',
  app_key VARCHAR(50) NOT NULL COMMENT '应用Key(唯一)',
  app_secret VARCHAR(200) NOT NULL COMMENT '应用密钥(AES加密存储)',
  description VARCHAR(500) DEFAULT NULL COMMENT '应用描述',
  scopes VARCHAR(500) DEFAULT NULL COMMENT '授权范围(逗号分隔)',
  rate_limit INT NOT NULL DEFAULT 100 COMMENT '每秒请求数限制',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by BIGINT DEFAULT NULL COMMENT '创建人',
  update_by BIGINT DEFAULT NULL COMMENT '更新人',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
  tenant_id BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_key (app_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开放API应用表';

-- 开放API调用日志表
CREATE TABLE IF NOT EXISTS openapi_log (
  id BIGINT NOT NULL COMMENT '主键ID',
  app_id BIGINT NOT NULL COMMENT '应用ID',
  api_path VARCHAR(500) DEFAULT NULL COMMENT '请求路径',
  request_method VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
  request_ip VARCHAR(50) DEFAULT NULL COMMENT '请求IP',
  request_time DATETIME DEFAULT NULL COMMENT '请求时间',
  response_status INT DEFAULT NULL COMMENT '响应状态码',
  cost_ms INT DEFAULT NULL COMMENT '耗时(毫秒)',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  create_by BIGINT DEFAULT NULL COMMENT '创建人',
  update_by BIGINT DEFAULT NULL COMMENT '更新人',
  deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
  tenant_id BIGINT DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (id),
  KEY idx_app_id (app_id),
  KEY idx_request_time (request_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='开放API调用日志表';
