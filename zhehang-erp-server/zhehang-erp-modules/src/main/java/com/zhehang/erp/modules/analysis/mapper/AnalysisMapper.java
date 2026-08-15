package com.zhehang.erp.modules.analysis.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 经营分析聚合查询(只读,基于订单/收款/续费/客户/线索真实数据)。
 */
@Mapper
public interface AnalysisMapper {

    /** 月度已确认收款(按到账月) */
    List<Map<String, Object>> monthlyReceipt(@Param("year") int year);

    /** 月度新客户数 */
    List<Map<String, Object>> monthlyNewCustomers(@Param("year") int year);

    /** 月度已确认/完成订单 */
    List<Map<String, Object>> monthlyOrders(@Param("year") int year);

    /** 新单分析:按月+服务类型聚合 */
    List<Map<String, Object>> newOrderDetail(@Param("year") int year, @Param("month") Integer month);

    /** 月度已确认续费订单数 */
    List<Map<String, Object>> monthlyRenewalOrders(@Param("year") int year);

    /** 应收续费状态汇总 */
    List<Map<String, Object>> receivableSummary();

    /** 应收续费按月欠费 */
    List<Map<String, Object>> receivableMonthly(@Param("year") int year);

    /** 流失风险:90天内到期且未续签的已签合同 */
    List<Map<String, Object>> lossRisk();

    /** 客户价值聚合(按累计成交金额分档) */
    List<Map<String, Object>> customerValue();

    /** 线索来源投产(线索数/转化数) */
    List<Map<String, Object>> leadRoi(@Param("start") String start, @Param("end") String end);

    /** 成交客户来源(按客户来源聚合) */
    List<Map<String, Object>> customerSource(@Param("start") String start, @Param("end") String end);

    /** 线索状态漏斗(1新建 2跟进中 3已转化 4无效) */
    List<Map<String, Object>> leadFunnel();

    /** 月度跟进量 */
    List<Map<String, Object>> monthlyFollows(@Param("year") int year);

    /** 月度通话量(含接通) */
    List<Map<String, Object>> monthlyCalls(@Param("year") int year, @Param("tenantId") Long tenantId);

    /** 销售人效:按坐席聚合通话/接通/跟进 */
    List<Map<String, Object>> salesEffort(@Param("year") int year, @Param("tenantId") Long tenantId);
}
