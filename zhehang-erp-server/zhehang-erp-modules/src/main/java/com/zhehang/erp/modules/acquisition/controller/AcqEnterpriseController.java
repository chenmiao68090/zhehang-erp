package com.zhehang.erp.modules.acquisition.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseCardVO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseQueryDTO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseStatsVO;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterprise;
import com.zhehang.erp.modules.acquisition.service.IAcqEnterpriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/acquisition/enterprise")
@RequiredArgsConstructor
public class AcqEnterpriseController {

    private final IAcqEnterpriseService enterpriseService;

    @GetMapping("/list")
    public R<IPage<EnterpriseCardVO>> list(EnterpriseQueryDTO query) {
        return R.ok(enterpriseService.queryEnterprisePage(query));
    }

    @GetMapping("/stats")
    public R<EnterpriseStatsVO> stats(EnterpriseQueryDTO query) {
        return R.ok(enterpriseService.getStats(query));
    }

    @GetMapping("/{id}")
    public R<AcqEnterprise> detail(@PathVariable Long id) {
        return R.ok(enterpriseService.getDetail(id));
    }

    @PostMapping("/batch-unlock")
    public R<Void> batchUnlock(@RequestBody Map<String, Object> params) {
        List<Long> enterpriseIds = parseIdList(params.get("enterpriseIds"));
        Long userId = parseLong(params.get("userId"));
        enterpriseService.batchUnlock(enterpriseIds, userId);
        return R.ok();
    }

    @PostMapping("/batch-add-crm")
    public R<Void> batchAddCrm(@RequestBody Map<String, Object> params) {
        List<Long> enterpriseIds = parseIdList(params.get("enterpriseIds"));
        String crmType = params.get("crmType") == null ? "lead" : params.get("crmType").toString();
        Long userId = parseLong(params.get("userId"));
        enterpriseService.batchAddToCrm(enterpriseIds, crmType, userId);
        return R.ok();
    }

    @SuppressWarnings("unchecked")
    private List<Long> parseIdList(Object value) {
        List<Long> ids = new ArrayList<>();
        if (value instanceof List) {
            for (Object item : (List<Object>) value) {
                Long id = parseLong(item);
                if (id != null) {
                    ids.add(id);
                }
            }
        }
        return ids;
    }

    private Long parseLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
