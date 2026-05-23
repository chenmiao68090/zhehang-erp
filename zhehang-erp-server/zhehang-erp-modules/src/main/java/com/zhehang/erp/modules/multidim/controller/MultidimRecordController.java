package com.zhehang.erp.modules.multidim.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.multidim.domain.dto.RecordQueryDTO;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimRecord;
import com.zhehang.erp.modules.multidim.service.IMultidimRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/multidim/record")
@RequiredArgsConstructor
public class MultidimRecordController {

    private final IMultidimRecordService recordService;

    @PostMapping("/query")
    public R<IPage<MultidimRecord>> query(@RequestBody RecordQueryDTO query) {
        return R.ok(recordService.queryRecords(query));
    }

    @GetMapping("/{id}")
    public R<MultidimRecord> getInfo(@PathVariable Long id) {
        return R.ok(recordService.getById(id));
    }

    @PostMapping
    @Log(module = "多维表格记录", type = Log.OperationType.INSERT)
    public R<MultidimRecord> add(@RequestBody MultidimRecord record) {
        recordService.save(record);
        return R.ok(record);
    }

    @PutMapping
    @Log(module = "多维表格记录", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody MultidimRecord record) {
        recordService.updateById(record);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "多维表格记录", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        recordService.removeById(id);
        return R.ok();
    }

    @PostMapping("/batchDelete")
    @Log(module = "多维表格记录", type = Log.OperationType.DELETE)
    public R<Void> batchDelete(@RequestBody List<Long> ids) {
        recordService.batchDelete(ids);
        return R.ok();
    }
}
