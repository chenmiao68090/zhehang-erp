package com.zhehang.erp.modules.dashboard.service;

import com.zhehang.erp.modules.dashboard.domain.entity.DashboardMemo;

import java.util.List;
import java.util.Map;

public interface IDashboardMemoService {
    List<DashboardMemo> listMine(String scope, Boolean completed, String keyword, Integer limit);

    Map<String, Long> summary();

    boolean add(DashboardMemo memo);

    boolean updateMine(DashboardMemo memo);

    boolean setCompleted(Long id, Boolean completed);

    boolean removeMine(Long id);
}
