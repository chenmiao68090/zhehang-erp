package com.zhehang.erp.modules.channel.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.channel.domain.BizProcurement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BizProcurementMapper extends BaseMapper<BizProcurement> {

    /**
     * 锁定当前租户的一张采购单，使付款、入库等状态迁移在同一采购单上串行执行。
     */
    @Select("SELECT * FROM biz_procurement "
            + "WHERE id = #{id} AND tenant_id = #{tenantId} AND deleted = 0 "
            + "LIMIT 1 FOR UPDATE")
    BizProcurement selectForUpdate(@Param("id") Long id, @Param("tenantId") Long tenantId);
}
