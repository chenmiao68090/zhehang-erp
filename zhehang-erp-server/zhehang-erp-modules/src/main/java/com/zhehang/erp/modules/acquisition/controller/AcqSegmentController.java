package com.zhehang.erp.modules.acquisition.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseCardVO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseQueryDTO;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqSegment;
import com.zhehang.erp.modules.acquisition.service.IAcqEnterpriseService;
import com.zhehang.erp.modules.acquisition.service.IAcqSegmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/acquisition/segment")
@RequiredArgsConstructor
public class AcqSegmentController {

    private final IAcqSegmentService segmentService;
    private final IAcqEnterpriseService enterpriseService;

    @GetMapping("/list")
    public R<List<AcqSegment>> list() {
        return R.ok(segmentService.listSegments());
    }

    @GetMapping("/{code}/enterprises")
    public R<IPage<EnterpriseCardVO>> enterprisesBySegment(@PathVariable("code") String code,
                                                           EnterpriseQueryDTO query) {
        if (query == null) {
            query = new EnterpriseQueryDTO();
        }
        query.setSegmentCode(code);
        return R.ok(enterpriseService.queryEnterprisePage(query));
    }
}
