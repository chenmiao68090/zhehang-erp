package com.zhehang.erp.modules.report.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface ReportDefinitionMapper extends BaseMapper<ReportDefinition> {
    /**
     * Execute a whitelisted SELECT statement and return rows as maps.
     */
    List<Map<String, Object>> executeSelect(@Param("sql") String sql);
}
