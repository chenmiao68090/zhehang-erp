package com.zhehang.erp.modules.analysis.service;

import java.util.Map;

/**
 * 经营分析服务(只读聚合,老板/主管/经理可见)。
 */
public interface AnalysisService {

    /** 年度经营总览:月度收款/新客户/新订单 */
    Map<String, Object> overview(int year);

    /** 新单分析:按月+服务类型 */
    Map<String, Object> newOrders(int year, Integer month);

    /** 续费分析:月度续费订单 + 应收续费汇总/按月欠费 */
    Map<String, Object> renewal(int year);

    /** 流失风险:90天内到期未续合同 */
    Map<String, Object> loss();

    /** 客户价值:按累计成交金额分档 */
    Map<String, Object> customerValue();

    /** 线索投产:线索来源转化 + 成交客户来源 */
    Map<String, Object> leadRoi(String start, String end);

    /** 销售分析:线索漏斗/月度跟进/月度通话/销售人效(真实数据) */
    Map<String, Object> sales(int year);
}
