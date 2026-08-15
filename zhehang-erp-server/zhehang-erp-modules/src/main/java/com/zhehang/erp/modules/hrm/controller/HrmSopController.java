package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSop;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSopTrainingRecord;
import com.zhehang.erp.modules.hrm.mapper.HrmSopMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmSopTrainingRecordMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hrm/sop")
@RequiredArgsConstructor
public class HrmSopController {

    private static final String RESULT_PENDING = "待考核";
    private static final String RESULT_PASS = "通过";
    private static final String RESULT_FAIL = "未通过";

    private final HrmSopMapper sopMapper;
    private final HrmSopTrainingRecordMapper recordMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<HrmSop>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                 @RequestParam(defaultValue = "20") Integer pageSize,
                                 @RequestParam(required = false) String keyword,
                                 @RequestParam(required = false) String position,
                                 @RequestParam(required = false) String scenario,
                                 @RequestParam(required = false) Boolean enabled) {
        LambdaQueryWrapper<HrmSop> wrapper = new LambdaQueryWrapper<HrmSop>()
                .like(StringUtils.hasText(keyword), HrmSop::getSopTitle, keyword)
                .like(StringUtils.hasText(position), HrmSop::getApplicablePositions, position)
                .eq(StringUtils.hasText(scenario), HrmSop::getBusinessScenario, scenario)
                .eq(enabled != null, HrmSop::getEnabled, enabled)
                .eq(!canManage(), HrmSop::getEnabled, true)
                .orderByDesc(HrmSop::getUpdateTime)
                .orderByDesc(HrmSop::getId);
        return R.ok(sopMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    @GetMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    public R<HrmSop> detail(@PathVariable Long id) {
        HrmSop sop = requireSop(id);
        if (!canManage() && !Boolean.TRUE.equals(sop.getEnabled())) {
            throw new BusinessException("该 SOP 已停用");
        }
        markSopUsed(id);
        sop = requireSop(id);
        return R.ok(sop);
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmSop sop) {
        requireContentManage();
        fillSopDefaults(sop);
        sop.setId(null);
        sopMapper.insert(sop);
        return R.ok();
    }

    @PutMapping
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmSop sop) {
        requireContentManage();
        if (sop.getId() == null) {
            throw new BusinessException("SOP ID 不能为空");
        }
        requireSop(sop.getId());
        fillSopDefaults(sop);
        sopMapper.updateById(sop);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        requireContentManage();
        sopMapper.deleteById(id);
        return R.ok();
    }

    @GetMapping("/training/records")
    public R<IPage<HrmSopTrainingRecord>> records(@RequestParam(defaultValue = "1") Integer pageNum,
                                                  @RequestParam(defaultValue = "20") Integer pageSize,
                                                  @RequestParam(required = false) Long employeeId,
                                                  @RequestParam(required = false) Boolean completed,
                                                  @RequestParam(required = false) String assessmentResult,
                                                  @RequestParam(required = false) String keyword) {
        boolean manager = canManage();
        LambdaQueryWrapper<HrmSopTrainingRecord> wrapper = new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .eq(employeeId != null && manager, HrmSopTrainingRecord::getEmployeeId, employeeId)
                .eq(completed != null, HrmSopTrainingRecord::getCompleted, completed)
                .eq(StringUtils.hasText(assessmentResult), HrmSopTrainingRecord::getAssessmentResult, assessmentResult)
                .and(StringUtils.hasText(keyword), w -> w.like(HrmSopTrainingRecord::getEmployeeName, keyword)
                        .or()
                        .like(HrmSopTrainingRecord::getSopTitle, keyword)
                        .or()
                        .like(HrmSopTrainingRecord::getTrainingTheme, keyword))
                .orderByAsc(HrmSopTrainingRecord::getCompleted)
                .orderByDesc(HrmSopTrainingRecord::getTrainingTime)
                .orderByDesc(HrmSopTrainingRecord::getId);
        if (!manager) {
            wrapper.eq(HrmSopTrainingRecord::getEmployeeId, requireCurrentEmployeeId());
        }
        return R.ok(recordMapper.selectPage(new Page<>(pageNum, pageSize), wrapper));
    }

    /** SOP 分配用精简员工列表:只返回姓名/部门/岗位,给老板/人事/主管选人。 */
    @GetMapping("/employees")
    public R<List<EmployeeRosterVO>> employees() {
        requireManage();
        return R.ok(employeeMapper.selectRoster());
    }

    @PostMapping("/training/assign")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.INSERT)
    public R<Map<String, Integer>> assign(@RequestBody AssignTrainingRequest request) {
        requireManage();
        if (request == null || request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            throw new BusinessException("请选择要培训的员工");
        }
        if (request.getSopIds() == null || request.getSopIds().isEmpty()) {
            throw new BusinessException("请选择要学习的 SOP");
        }

        List<HrmSop> sops = sopMapper.selectList(new LambdaQueryWrapper<HrmSop>()
                .in(HrmSop::getId, request.getSopIds())
                .eq(HrmSop::getEnabled, true));
        if (sops.isEmpty()) {
            throw new BusinessException("选中的 SOP 不存在或已停用");
        }

        List<OrgEmployee> employees = employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .in(OrgEmployee::getId, request.getEmployeeIds()));
        if (employees.isEmpty()) {
            throw new BusinessException("选中的员工不存在");
        }

        int count = 0;
        LocalDateTime now = LocalDateTime.now();
        String assignerName = SecurityUtils.getCurrentUsername();
        Long assignerId = SecurityUtils.getCurrentUserId();
        for (OrgEmployee employee : employees) {
            for (HrmSop sop : sops) {
                HrmSopTrainingRecord record = new HrmSopTrainingRecord();
                record.setEmployeeId(employee.getId());
                record.setEmployeeName(employee.getName());
                record.setEmployeeUserId(employee.getUserId());
                record.setTrainingTheme(StringUtils.hasText(request.getTrainingTheme())
                        ? request.getTrainingTheme()
                        : sop.getSopTitle());
                record.setSopId(sop.getId());
                record.setSopTitle(sop.getSopTitle());
                record.setSopVersion(sop.getVersionNo());
                record.setTrainingTime(request.getTrainingTime() != null ? request.getTrainingTime() : now);
                record.setCompleted(false);
                record.setAssessmentResult(RESULT_PENDING);
                record.setAssignerId(assignerId);
                record.setAssignerName(assignerName);
                recordMapper.insert(record);
                markSopUsed(sop.getId());
                count++;
            }
        }
        Map<String, Integer> result = new HashMap<>();
        result.put("assigned", count);
        return R.ok(result);
    }

    @PostMapping("/training/{id}/complete")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.UPDATE)
    public R<Void> complete(@PathVariable Long id) {
        HrmSopTrainingRecord record = requireRecord(id);
        if (!canManage() && !requireCurrentEmployeeId().equals(record.getEmployeeId())) {
            throw new BusinessException("只能完成自己的培训任务");
        }
        record.setCompleted(true);
        record.setCompletedTime(LocalDateTime.now());
        if (!StringUtils.hasText(record.getAssessmentResult())) {
            record.setAssessmentResult(RESULT_PENDING);
        }
        recordMapper.updateById(record);
        return R.ok();
    }

    @PostMapping("/training/{id}/review")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "员工培训/SOP", type = Log.OperationType.UPDATE)
    public R<Void> review(@PathVariable Long id, @RequestBody ReviewTrainingRequest request) {
        requireManage();
        if (request == null || !StringUtils.hasText(request.getAssessmentResult())) {
            throw new BusinessException("请选择考核结果");
        }
        String result = request.getAssessmentResult();
        if (!RESULT_PASS.equals(result) && !RESULT_FAIL.equals(result)) {
            throw new BusinessException("考核结果只能为通过或未通过");
        }
        HrmSopTrainingRecord record = requireRecord(id);
        if (!Boolean.TRUE.equals(record.getCompleted())) {
            throw new BusinessException("员工完成培训后才能记录考核结果");
        }
        record.setAssessmentResult(result);
        record.setImprovement(request.getImprovement());
        record.setRetrainTime(RESULT_FAIL.equals(result) ? request.getRetrainTime() : null);
        record.setReviewerId(SecurityUtils.getCurrentUserId());
        record.setReviewerName(SecurityUtils.getCurrentUsername());
        record.setReviewTime(LocalDateTime.now());
        recordMapper.updateById(record);
        return R.ok();
    }

    @GetMapping("/dashboard")
    public R<Map<String, Object>> dashboard() {
        requireManage();
        long totalSops = sopMapper.selectCount(new LambdaQueryWrapper<>());
        long enabledSops = sopMapper.selectCount(new LambdaQueryWrapper<HrmSop>().eq(HrmSop::getEnabled, true));
        long recordTotal = recordMapper.selectCount(new LambdaQueryWrapper<>());
        long completedCount = recordMapper.selectCount(new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .eq(HrmSopTrainingRecord::getCompleted, true));
        long incompleteCount = recordMapper.selectCount(new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .eq(HrmSopTrainingRecord::getCompleted, false));
        long passCount = recordMapper.selectCount(new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .eq(HrmSopTrainingRecord::getAssessmentResult, RESULT_PASS));
        long failCount = recordMapper.selectCount(new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .eq(HrmSopTrainingRecord::getAssessmentResult, RESULT_FAIL));
        long assessedCount = passCount + failCount;

        List<HrmSopTrainingRecord> pendingRecords = recordMapper.selectList(new LambdaQueryWrapper<HrmSopTrainingRecord>()
                .and(w -> w.eq(HrmSopTrainingRecord::getCompleted, false)
                        .or()
                        .eq(HrmSopTrainingRecord::getAssessmentResult, RESULT_FAIL))
                .orderByDesc(HrmSopTrainingRecord::getTrainingTime)
                .last("LIMIT 8"));
        List<HrmSop> topSops = sopMapper.selectList(new LambdaQueryWrapper<HrmSop>()
                .orderByDesc(HrmSop::getUsageCount)
                .orderByDesc(HrmSop::getLastUsedTime)
                .last("LIMIT 8"));

        Map<String, Object> data = new HashMap<>();
        data.put("totalSops", totalSops);
        data.put("enabledSops", enabledSops);
        data.put("recordTotal", recordTotal);
        data.put("completedCount", completedCount);
        data.put("incompleteCount", incompleteCount);
        data.put("retrainCount", failCount);
        data.put("completionRate", recordTotal == 0 ? 0 : Math.round(completedCount * 100.0 / recordTotal));
        data.put("passRate", assessedCount == 0 ? 0 : Math.round(passCount * 100.0 / assessedCount));
        data.put("pendingRecords", pendingRecords);
        data.put("topSops", topSops);
        return R.ok(data);
    }

    private boolean canManage() {
        return dataScopeHelper.isHrAdminOrBoss() || dataScopeHelper.isManagerOrAdmin();
    }

    private void requireManage() {
        if (!canManage()) {
            throw new BusinessException("只有老板、人事或主管可以处理培训任务与考核");
        }
    }

    private void requireContentManage() {
        boolean allowed = SecurityUtils.hasAnyRole("hr", "super_admin", "sys_admin", "admin")
                || Long.valueOf(1L).equals(SecurityUtils.getCurrentUserId());
        if (!allowed) {
            throw new BusinessException("只有人事或培训管理员可以维护 SOP 标准");
        }
    }

    private HrmSop requireSop(Long id) {
        if (id == null) {
            throw new BusinessException("SOP ID 不能为空");
        }
        HrmSop sop = sopMapper.selectById(id);
        if (sop == null) {
            throw new BusinessException("SOP 不存在");
        }
        return sop;
    }

    private HrmSopTrainingRecord requireRecord(Long id) {
        if (id == null) {
            throw new BusinessException("培训记录 ID 不能为空");
        }
        HrmSopTrainingRecord record = recordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException("培训记录不存在");
        }
        return record;
    }

    private Long requireCurrentEmployeeId() {
        Long employeeId = dataScopeHelper.currentEmployeeId();
        if (employeeId == null) {
            throw new BusinessException("当前账号尚未关联员工档案");
        }
        return employeeId;
    }

    private void fillSopDefaults(HrmSop sop) {
        if (!StringUtils.hasText(sop.getSopTitle())) {
            throw new BusinessException("SOP 标题不能为空");
        }
        if (!StringUtils.hasText(sop.getApplicablePositions())) {
            throw new BusinessException("请选择适用岗位");
        }
        if (!StringUtils.hasText(sop.getBusinessScenario())) {
            throw new BusinessException("请选择业务场景");
        }
        if (!StringUtils.hasText(sop.getStandardSteps())) {
            throw new BusinessException("标准步骤不能为空");
        }
        if (!StringUtils.hasText(sop.getCheckStandard())) {
            throw new BusinessException("检查标准不能为空");
        }
        if (!StringUtils.hasText(sop.getVersionNo())) {
            sop.setVersionNo("v1.0");
        }
        if (sop.getEnabled() == null) {
            sop.setEnabled(true);
        }
        if (sop.getUsageCount() == null) {
            sop.setUsageCount(0);
        }
        if (sop.getOwnerId() != null) {
            OrgEmployee owner = employeeMapper.selectById(sop.getOwnerId());
            if (owner != null) {
                sop.setOwnerName(owner.getName());
            }
        }
    }

    private void markSopUsed(Long sopId) {
        sopMapper.update(null, new LambdaUpdateWrapper<HrmSop>()
                .eq(HrmSop::getId, sopId)
                .setSql("usage_count = IFNULL(usage_count, 0) + 1")
                .set(HrmSop::getLastUsedTime, LocalDateTime.now()));
    }

    @Data
    public static class AssignTrainingRequest {
        private List<Long> employeeIds = new ArrayList<>();
        private List<Long> sopIds = new ArrayList<>();
        private String trainingTheme;
        private LocalDateTime trainingTime;
    }

    @Data
    public static class ReviewTrainingRequest {
        private String assessmentResult;
        private String improvement;
        private LocalDateTime retrainTime;
    }
}
