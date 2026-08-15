package com.zhehang.erp.modules.admin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.admin.domain.AdminAsset;
import com.zhehang.erp.modules.admin.domain.AdminAssetRecord;
import com.zhehang.erp.modules.admin.mapper.AdminAssetMapper;
import com.zhehang.erp.modules.admin.mapper.AdminAssetRecordMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 行政·固定资产管理(全生命周期台账)。
 * 资产主表 admin_asset 记录当前状态/领用人;每次领用/归还/维保/报废动作都落一条 admin_asset_record 流水。
 */
@RestController
@RequestMapping("/admin/asset")
@RequiredArgsConstructor
public class AdminAssetController {

    private final AdminAssetMapper mapper;
    private final AdminAssetRecordMapper recordMapper;

    @GetMapping("/list")
    public R<List<AdminAsset>> list(@RequestParam(required = false) String keyword,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) String category) {
        LambdaQueryWrapper<AdminAsset> qw = new LambdaQueryWrapper<AdminAsset>()
                .and(StringUtils.hasText(keyword), w -> w
                        .like(AdminAsset::getAssetNo, keyword)
                        .or().like(AdminAsset::getAssetName, keyword)
                        .or().like(AdminAsset::getHolder, keyword))
                .eq(StringUtils.hasText(status), AdminAsset::getStatus, status)
                .eq(StringUtils.hasText(category), AdminAsset::getCategory, category)
                .orderByDesc(AdminAsset::getId);
        return R.ok(mapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "固定资产", type = Log.OperationType.OTHER)
    public R<Void> save(@RequestBody AdminAsset entity) {
        if (entity.getId() == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "固定资产", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }

    // ==================== 全生命周期动作 ====================

    /** 领用:资产 holderId=employeeId,holder=employeeName,status=在用;落一条领用流水 */
    @PostMapping("/{id}/claim")
    @Log(module = "固定资产", type = Log.OperationType.UPDATE)
    public R<Void> claim(@PathVariable Long id, @RequestBody AssetActionDTO body) {
        AdminAsset asset = mapper.selectById(id);
        if (asset == null) {
            return R.fail("资产不存在");
        }
        if (body.getEmployeeId() == null) {
            return R.fail("请选择领用人");
        }
        asset.setHolderId(body.getEmployeeId());
        asset.setHolder(body.getEmployeeName());
        asset.setUseDate(orToday(body.getRecordDate()));
        asset.setStatus("在用");
        mapper.updateById(asset);

        saveRecord(asset, "领用", body.getRecordDate(), null, "在用", body.getEmployeeId(), body.getEmployeeName(), body.getRemark());
        return R.ok();
    }

    /** 归还:资产 holderId=null,holder=null,status=闲置;落一条归还流水 */
    @PostMapping("/{id}/return")
    @Log(module = "固定资产", type = Log.OperationType.UPDATE)
    public R<Void> ret(@PathVariable Long id, @RequestBody AssetActionDTO body) {
        AdminAsset asset = mapper.selectById(id);
        if (asset == null) {
            return R.fail("资产不存在");
        }
        // 流水里记下归还前的领用人,便于追溯
        Long returnEmpId = asset.getHolderId();
        String returnEmpName = asset.getHolder();
        asset.setHolderId(null);
        asset.setHolder(null);
        asset.setStatus("闲置");
        // MyBatis-Plus updateById 默认跳过 null 字段,这里必须用 LambdaUpdateWrapper 强制把领用人置空,否则离职归还校验会一直把已归还资产算作未归还
        mapper.update(null, new LambdaUpdateWrapper<AdminAsset>()
                .eq(AdminAsset::getId, id)
                .set(AdminAsset::getHolderId, null)
                .set(AdminAsset::getHolder, null)
                .set(AdminAsset::getStatus, "闲置"));

        saveRecord(asset, "归还", body.getRecordDate(), null, "闲置", returnEmpId, returnEmpName, body.getRemark());
        return R.ok();
    }

    /** 维保:落一条维保流水(资产状态按 body.status 同步,缺省不改主表状态) */
    @PostMapping("/{id}/maintain")
    @Log(module = "固定资产", type = Log.OperationType.UPDATE)
    public R<Void> maintain(@PathVariable Long id, @RequestBody AssetActionDTO body) {
        AdminAsset asset = mapper.selectById(id);
        if (asset == null) {
            return R.fail("资产不存在");
        }
        if (StringUtils.hasText(body.getStatus())) {
            asset.setStatus(body.getStatus());
            mapper.updateById(asset);
        }
        saveRecord(asset, "维保", body.getRecordDate(), body.getAmount(), body.getStatus(), null, null, body.getRemark());
        return R.ok();
    }

    /** 报废:资产 status=报废,holderId=null;落一条报废流水 */
    @PostMapping("/{id}/scrap")
    @Log(module = "固定资产", type = Log.OperationType.UPDATE)
    public R<Void> scrap(@PathVariable Long id, @RequestBody AssetActionDTO body) {
        AdminAsset asset = mapper.selectById(id);
        if (asset == null) {
            return R.fail("资产不存在");
        }
        asset.setStatus("报废");
        asset.setHolderId(null);
        asset.setHolder(null);
        // 同归还:用 LambdaUpdateWrapper 强制置空 holderId/holder 并改状态(updateById 会丢弃 null 字段)
        mapper.update(null, new LambdaUpdateWrapper<AdminAsset>()
                .eq(AdminAsset::getId, id)
                .set(AdminAsset::getStatus, "报废")
                .set(AdminAsset::getHolderId, null)
                .set(AdminAsset::getHolder, null));

        saveRecord(asset, "报废", body.getRecordDate(), null, "报废", null, null, body.getRemark());
        return R.ok();
    }

    /** 该资产全部流水(按 id 倒序) */
    @GetMapping("/{id}/records")
    public R<List<AdminAssetRecord>> records(@PathVariable Long id) {
        LambdaQueryWrapper<AdminAssetRecord> qw = new LambdaQueryWrapper<AdminAssetRecord>()
                .eq(AdminAssetRecord::getAssetId, id)
                .orderByDesc(AdminAssetRecord::getId);
        return R.ok(recordMapper.selectList(qw));
    }

    /** 某员工名下未归还资产(holderId=employeeId 且 status!=报废)——离职归还校验用 */
    @GetMapping("/unreturned")
    public R<List<AdminAsset>> unreturned(@RequestParam Long employeeId) {
        LambdaQueryWrapper<AdminAsset> qw = new LambdaQueryWrapper<AdminAsset>()
                .eq(AdminAsset::getHolderId, employeeId)
                .ne(AdminAsset::getStatus, "报废")
                .orderByDesc(AdminAsset::getId);
        return R.ok(mapper.selectList(qw));
    }

    // ==================== helpers ====================

    private void saveRecord(AdminAsset asset, String type, LocalDate recordDate, BigDecimal amount,
                            String status, Long employeeId, String employeeName, String remark) {
        AdminAssetRecord record = new AdminAssetRecord();
        record.setAssetId(asset.getId());
        record.setAssetName(asset.getAssetName());
        record.setType(type);
        record.setRecordDate(orToday(recordDate));
        record.setAmount(amount);
        record.setStatus(status);
        record.setEmployeeId(employeeId);
        record.setEmployeeName(employeeName);
        record.setQty(asset.getQuantity());
        record.setOperator(SecurityUtils.getCurrentUsername());
        record.setRemark(remark);
        recordMapper.insert(record);
    }

    private LocalDate orToday(LocalDate date) {
        return date != null ? date : LocalDate.now();
    }

    /** 动作请求体:领用/归还/维保/报废共用 */
    @Data
    public static class AssetActionDTO {
        private Long employeeId;
        private String employeeName;
        private LocalDate recordDate;
        private BigDecimal amount;
        private String status;
        private String remark;
    }
}
