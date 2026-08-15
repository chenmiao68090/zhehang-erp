package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.crm.domain.entity.CrmLeadStageEvent;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CrmLeadStageEventMapper extends BaseMapper<CrmLeadStageEvent> {

    @Insert("""
            INSERT IGNORE INTO crm_lead_stage_event
              (tenant_id, lead_id, event_key, from_stage_code, to_stage_code,
               event_type, source_type, source_id, owner_id, dept_id, operator_id,
               occurred_at, create_time, update_time, create_by, update_by, deleted)
            VALUES
              (#{event.tenantId}, #{event.leadId}, #{event.eventKey}, #{event.fromStageCode},
               #{event.toStageCode}, #{event.eventType}, #{event.sourceType}, #{event.sourceId},
               #{event.ownerId}, #{event.deptId}, #{event.operatorId}, #{event.occurredAt},
               #{event.createTime}, #{event.updateTime}, #{event.createBy}, #{event.updateBy}, 0)
            """)
    int insertIgnore(@Param("event") CrmLeadStageEvent event);
}
