package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.crm.domain.vo.SalesStageCustomerVO;
import com.zhehang.erp.modules.crm.support.SalesConsoleQueryContext;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Mapper
public interface SalesOperatingConsoleMapper {
    Map<String, Object> selectLeadSummary(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectStageSnapshot(@Param("ctx") SalesConsoleQueryContext context);
    Map<String, Object> selectOrderSummary(@Param("ctx") SalesConsoleQueryContext context);
    Map<String, Object> selectRenewalSummary(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectStageEventFlows(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectActionRows(@Param("ctx") SalesConsoleQueryContext context,
                                               @Param("limit") int limit);
    List<Map<String, Object>> selectOwnerLeadStats(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectOwnerOrderStats(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectSourceQuality(@Param("ctx") SalesConsoleQueryContext context,
                                                  @Param("limit") int limit);
    List<Map<String, Object>> selectLossReasons(@Param("ctx") SalesConsoleQueryContext context,
                                                @Param("limit") int limit);
    List<Map<String, Object>> selectOwnerOptions(@Param("ctx") SalesConsoleQueryContext context);
    List<Map<String, Object>> selectDepartmentOptions(@Param("ctx") SalesConsoleQueryContext context);
    LocalDateTime selectFirstStageEventTime(@Param("ctx") SalesConsoleQueryContext context);
    IPage<SalesStageCustomerVO> selectStageCustomers(Page<SalesStageCustomerVO> page,
                                                     @Param("ctx") SalesConsoleQueryContext context,
                                                     @Param("stageCode") String stageCode,
                                                     @Param("keyword") String keyword);
}
