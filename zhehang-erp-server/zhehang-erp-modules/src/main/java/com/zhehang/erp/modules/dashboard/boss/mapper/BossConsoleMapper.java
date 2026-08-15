package com.zhehang.erp.modules.dashboard.boss.mapper;

import org.apache.ibatis.annotations.Mapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 老板总控台的真实统计查询。
 * 说明:所有表都带 tenant_id,由 MyBatis-Plus 租户拦截器自动按当前公司隔离;
 * 逻辑删除列 deleted 在原生 XML 里需显式写 deleted=0(拦截器只对实体 BaseMapper 生效)。
 * 跨表指标故意拆成"单表标量"方法,避免租户拦截器处理无主表子查询时的解析风险。
 */
@Mapper
public interface BossConsoleMapper {

    /** 客户问题:今日新增/未处理/逾期/P0(单表 crm_customer_issue) */
    Map<String, Object> customerIssueStat();

    /** 代账服务:在办/已完成/处理中/逾期(单表 biz_bookkeeping_order) */
    Map<String, Object> bookkeepingStat();

    // —— 销售线索(跨 4 表,拆标量) ——
    long countTodayLeads();
    long countTodayFollows();
    BigDecimal sumExpectAmount();
    BigDecimal sumDealAmountThisMonth();

    // —— 回款续费(跨 2 表,拆标量) ——
    BigDecimal sumTodayDue();
    BigDecimal sumTodayReceived();
    BigDecimal sumOverdueArrears();
    long countArrearsCustomers();

    /** 员工执行:按执行人聚合今日任务/逾期/已完成/总数(biz_task) */
    List<Map<String, Object>> employeeExec();

    // —— 异常清单(各限 10 条) ——
    List<Map<String, Object>> overdueIssues();
    List<Map<String, Object>> p0Issues();
    List<Map<String, Object>> bookkeepingAbnormal();
    List<Map<String, Object>> arrearsList();
}
