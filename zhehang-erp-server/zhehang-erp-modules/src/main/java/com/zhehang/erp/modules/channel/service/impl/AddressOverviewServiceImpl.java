package com.zhehang.erp.modules.channel.service.impl;

import com.zhehang.erp.modules.channel.mapper.AddressOverviewMapper;
import com.zhehang.erp.modules.channel.service.IAddressOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 地址资源总览(只读聚合)服务实现。
 *
 * <p>仅读取 {@code biz_address_resource},通过新建的 {@link AddressOverviewMapper} 聚合,
 * 不触碰既有的 {@code BizChannelServiceImpl}/{@code BizAddressResourceMapper} 等业务文件。</p>
 */
@Service
@RequiredArgsConstructor
public class AddressOverviewServiceImpl implements IAddressOverviewService {

    private final AddressOverviewMapper addressOverviewMapper;

    @Override
    public List<Map<String, Object>> byArea() {
        return addressOverviewMapper.countByArea();
    }

    @Override
    public List<Map<String, Object>> listByArea(String area, String status) {
        return addressOverviewMapper.listByArea(area, status);
    }

    @Override
    public Map<String, Object> summary() {
        List<Map<String, Object>> byStatus = addressOverviewMapper.countByStatus();

        long total = 0L;
        // 分状态计数明细,便于前端展示每种状态的数量
        Map<String, Long> statusCount = new LinkedHashMap<>();
        for (Map<String, Object> row : byStatus) {
            String status = row.get("status") == null ? "unknown" : String.valueOf(row.get("status"));
            long count = toLong(row.get("count"));
            statusCount.put(status, count);
            total += count;
        }

        // 语义汇总:available=空闲;reserved/sold=已用(占用);其余(expired/abnormal/unknown)单列
        long available = statusCount.getOrDefault("available", 0L);
        long reserved = statusCount.getOrDefault("reserved", 0L);
        long sold = statusCount.getOrDefault("sold", 0L);
        long expired = statusCount.getOrDefault("expired", 0L);
        long abnormal = statusCount.getOrDefault("abnormal", 0L);
        long used = reserved + sold;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", total);
        result.put("available", available);
        result.put("used", used);
        result.put("reserved", reserved);
        result.put("sold", sold);
        result.put("expired", expired);
        result.put("abnormal", abnormal);
        result.put("statusCount", statusCount);
        return result;
    }

    private long toLong(Object v) {
        if (v == null) {
            return 0L;
        }
        if (v instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(v.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
