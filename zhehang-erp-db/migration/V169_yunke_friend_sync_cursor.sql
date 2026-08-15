-- V169: 云客好友/群信息同步游标持久化
-- 背景: YunkeChatSyncJob.syncFriends 的游标原是方法内局部变量,每轮(10分钟)都从
-- 2020-01-01 重头爬、单轮上限120批后作废进度,永远追不到近期 → 聊天会话大量好友
-- 只显示 wxid 无昵称头像。仿 chat_cursor(V123) 把游标落库,跨轮续爬。
-- 好友(type=1)/群(type=2)两条增量流各一个游标,格式 yyyy-MM-dd HH:mm:ss(云客接口 startTime 入参)。
ALTER TABLE biz_yunke_config
    ADD COLUMN friend_cursor VARCHAR(32) NULL COMMENT '好友信息增量同步游标(末条updateTime)' AFTER chat_cursor,
    ADD COLUMN group_cursor  VARCHAR(32) NULL COMMENT '群信息增量同步游标(末条updateTime)' AFTER friend_cursor;
