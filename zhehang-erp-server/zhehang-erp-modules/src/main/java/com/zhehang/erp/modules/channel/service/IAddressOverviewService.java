package com.zhehang.erp.modules.channel.service;

import java.util.List;
import java.util.Map;

/**
 * 地址资源总览(只读聚合)服务。
 *
 * <p>基于渠道模块挂靠地址资源表 {@code biz_address_resource} 的只读统计,
 * 不修改任何既有业务文件。见 {@link com.zhehang.erp.modules.channel.mapper.AddressOverviewMapper}。</p>
 */
public interface IAddressOverviewService {

    /** 按行政区(所属区域)分组统计:返回 [{area, count}]。 */
    List<Map<String, Object>> byArea();

    /** 某行政区下的地址清单(全量,支持 status 过滤;area 为空则不限区域)。 */
    List<Map<String, Object>> listByArea(String area, String status);

    /** 汇总:地址总量、按状态计数、已用/空闲等。 */
    Map<String, Object> summary();
}
