-- R210 定向回滚。必须由 scripts/rollback-data-repair.sh 注入 @run_id。

DROP PROCEDURE IF EXISTS zh_assert_r210_rollback;
DELIMITER $$
CREATE PROCEDURE zh_assert_r210_rollback()
BEGIN
    IF @run_id IS NULL OR @run_id = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'R210 rollback requires run_id';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM data_repair_history WHERE run_id = @run_id AND status = 'SUCCESS') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'R210 run is not in SUCCESS state';
    END IF;
END$$
DELIMITER ;
CALL zh_assert_r210_rollback();
DROP PROCEDURE zh_assert_r210_rollback;

START TRANSACTION;

UPDATE biz_yunke_user_map t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_yunke_user_map' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_call_record t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_call_record' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_wechat_chat t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_wechat_chat' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_wechat_friend t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_wechat_friend' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_wechat_friend_info t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_wechat_friend_info' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_wechat_msg_stat t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_wechat_msg_stat' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;
UPDATE biz_yunke_config t JOIN integration_tenant_backfill_backup b
  ON b.run_id = @run_id AND b.source_table = 'biz_yunke_config' AND b.source_id = t.id
SET t.tenant_id = b.old_tenant_id WHERE t.tenant_id = b.new_tenant_id;

UPDATE integration_tenant_backfill_backup
SET rolled_back_at = NOW()
WHERE run_id = @run_id AND rolled_back_at IS NULL;
UPDATE integration_tenant_quarantine
SET status = 'ROLLED_BACK'
WHERE run_id = @run_id AND status = 'PENDING';
UPDATE data_repair_history
SET status = 'ROLLED_BACK', finished_at = NOW(), remark = '按最小快照定向回滚'
WHERE run_id = @run_id;

COMMIT;
