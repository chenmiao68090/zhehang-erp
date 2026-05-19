package com.zhehang.erp.modules.openapi.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.openapi.domain.entity.OpenapiLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface OpenapiLogMapper extends BaseMapper<OpenapiLog> {

    @Select("SELECT COUNT(*) FROM openapi_log WHERE DATE(request_time) = CURDATE() AND deleted = 0")
    long countToday();
}
