package com.zhehang.erp.modules.channel.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 运营服务中心·平台每日运营指标(美团/抖音/小红书等)。
 * 第一阶段手动录入(source=manual);接平台营销 API 后由同步任务写入(source=api)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_op_channel_metric")
public class BizOpChannelMetric extends BaseEntity {
    /** 平台:meituan/douyin/xiaohongshu/... */
    private String platform;
    /**
     * 数据类别:overview概览 / live直播 / video短视频 / message私信留资 / note笔记 等。
     * 向后兼容:老数据为 NULL,读取/唯一键判定时按 overview 处理。
     */
    private String category;
    /** 统计日期 */
    private LocalDate statDate;
    /** 浏览量 */
    private Long views;
    /** 访问量 */
    private Long visits;
    /** 咨询量 */
    private Long inquiries;
    /** 推广金额消耗 */
    private BigDecimal adCost;
    /** 来源:manual / api */
    private String source;
    /**
     * 该类别下的灵活指标 KV(JSON 字符串),如 {"场次":12,"时长":320,"观看人次":8500}。
     * overview 类别仍用上面 views/visits/inquiries/adCost 固定四指标;
     * 其他类别(直播/短视频/私信留资/笔记等)的指标存这里,由前端按类别配置渲染。
     */
    private String metrics;
    /** 备注 */
    private String remark;
}
