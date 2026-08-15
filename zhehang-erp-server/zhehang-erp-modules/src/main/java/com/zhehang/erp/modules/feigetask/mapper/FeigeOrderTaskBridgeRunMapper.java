package com.zhehang.erp.modules.feigetask.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.feigetask.domain.entity.FeigeOrderTaskBridgeRun;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface FeigeOrderTaskBridgeRunMapper extends BaseMapper<FeigeOrderTaskBridgeRun> {

    @Insert("""
            INSERT INTO feige_task_order_bridge_run
              (rule_id, rule_code, trigger_event, target_task_type, order_id, order_no,
               business_owner_id, dept_id,
               operator_id, operator_name, run_status, attempt_count,
               create_time, update_time, create_by, update_by, deleted, tenant_id, version)
            VALUES
              (#{ruleId}, #{ruleCode}, #{triggerEvent}, #{targetTaskType}, #{orderId}, #{orderNo},
               #{businessOwnerId}, #{deptId},
               #{operatorId}, #{operatorName}, 'pending', 0,
               NOW(), NOW(), #{operatorId}, #{operatorId}, 0, #{tenantId}, 0)
            ON DUPLICATE KEY UPDATE id = id
            """)
    int insertIdempotent(FeigeOrderTaskBridgeRun run);
}
