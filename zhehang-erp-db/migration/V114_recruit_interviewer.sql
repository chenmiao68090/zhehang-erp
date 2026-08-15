-- =============================================================================
-- V114  招聘模块增强(飞书建议 169):面试官从"姓名文本"升级为"关联员工/账号"。
--       在面试流转记录(hrm_interview_record)与候选人简历(hrm_resume)两处
--       各新增 interviewer_id(面试官 userId,BIGINT,= sys_user.id / org_employee.user_id)。
--       原有 interviewer(姓名文本)列保留作回显,不清洗历史数据;新数据两者一并写入。
--       面试评价(evaluation)、初面/面试时间(first_interview_time / interview_time)
--       两张表均已存在,本次不新增,故只补 interviewer_id。
--       幂等:参照 V102/V110/V111 的存储过程写法,逐列判断不存在才 ADD,重复执行安全。
-- =============================================================================

DROP PROCEDURE IF EXISTS add_recruit_interviewer_id;
DELIMITER //
CREATE PROCEDURE add_recruit_interviewer_id()
BEGIN
  -- 面试流转记录:分配面试官时落 userId,用于回显/后续待办提醒定位收件人
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_interview_record'
                   AND COLUMN_NAME = 'interviewer_id') THEN
    ALTER TABLE `hrm_interview_record`
      ADD COLUMN `interviewer_id` BIGINT NULL COMMENT '面试官 userId(sys_user.id / org_employee.user_id),原 interviewer 为姓名文本回显用';
  END IF;

  -- 候选人简历:约面登记的面试官同口径落 userId
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hrm_resume'
                   AND COLUMN_NAME = 'interviewer_id') THEN
    ALTER TABLE `hrm_resume`
      ADD COLUMN `interviewer_id` BIGINT NULL COMMENT '面试官 userId(sys_user.id / org_employee.user_id),原 interviewer 为姓名文本回显用';
  END IF;
END //
DELIMITER ;
CALL add_recruit_interviewer_id();
DROP PROCEDURE IF EXISTS add_recruit_interviewer_id;
