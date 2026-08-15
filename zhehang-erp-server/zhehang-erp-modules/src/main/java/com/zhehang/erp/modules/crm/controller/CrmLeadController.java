package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportConfirmRequest;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRequest;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.vo.CrmCustomer360VO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportPreviewVO;
import com.zhehang.erp.modules.crm.domain.vo.CrmLeadImportResultVO;
import com.zhehang.erp.modules.crm.service.CrmCustomer360Service;
import com.zhehang.erp.modules.crm.service.CrmLeadImportService;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/crm/lead")
@RequiredArgsConstructor
public class CrmLeadController {

    private final ICrmLeadService leadService;
    private final CrmCustomer360Service customer360Service;
    private final CrmLeadImportService leadImportService;
    private final com.zhehang.erp.modules.crm.support.DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<CrmLead>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long ownerId) {
        return R.ok(leadService.selectPage(pageNum, pageSize, firstText(name, keyword), source, status, ownerId));
    }

    @GetMapping("/{id}")
    public R<CrmLead> getInfo(@PathVariable Long id) {
        CrmLead lead = leadService.getById(id);
        // 越权校验:员工改 URL 传别人的线索ID也打不开;公海(pool)线索允许查看(领取前需看详情)
        if (lead != null && !"pool".equalsIgnoreCase(lead.getOwnership())
                && !dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            return R.fail(403, "无权限查看该线索");
        }
        return R.ok(lead);
    }

    /** 销售客户360:按线索串联当前用户有权查看的沟通、商机、交易和服务记录。 */
    @GetMapping("/{id}/360")
    public R<CrmCustomer360VO> customer360(@PathVariable Long id) {
        return R.ok(customer360Service.getByLeadId(id));
    }

    @PostMapping
    @Log(module = "线索管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmLead lead) {
        if (lead == null) {
            return R.fail("线索不能为空");
        }
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!dataScopeHelper.isManagerOrAdmin()) {
            if (lead.getOwnerId() != null && !lead.getOwnerId().equals(currentUserId)) {
                throw new BusinessException("普通销售不能替其他员工新建私海线索");
            }
            if (lead.getOwnerId() != null || "private".equalsIgnoreCase(lead.getOwnership())) {
                lead.setOwnerId(currentUserId);
                lead.setOwnership("private");
            } else {
                lead.setOwnerId(null);
                lead.setDeptId(null);
                lead.setOwnership("pool");
            }
        } else {
            if (lead.getOwnerId() != null && !dataScopeHelper.canAccessOwner(lead.getOwnerId())) {
                throw new BusinessException("不能把线索新建到数据范围外的员工名下");
            }
            if (lead.getOwnership() == null || lead.getOwnership().isEmpty()) {
                lead.setOwnership(lead.getOwnerId() != null ? "private" : "pool");
            }
        }
        // 生命周期只能从新建开始,不能由前端跳过跟进/转化流程。
        lead.setStatus(1);
        leadService.createManualLead(lead);
        return R.ok();
    }

    @PutMapping
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmLead lead) {
        leadService.updateLead(lead);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "线索管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        leadService.removeLead(id);
        return R.ok();
    }

    @PostMapping("/convert/{id}")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> convert(@PathVariable Long id) {
        leadService.convertToCustomer(id);
        return R.ok();
    }

    @PostMapping("/assign")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> assign(@RequestBody Map<String, Long> params) {
        leadService.assignLead(params.get("id"), params.get("ownerId"));
        return R.ok();
    }

    /** 标记为无效资源:置状态=4(无效)并把原因记入备注。必须填写原因。 */
    @PostMapping("/invalid")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> markInvalid(@RequestBody Map<String, Object> params) {
        Object idObj = params.get("id");
        if (idObj == null) {
            return R.fail("缺少线索ID");
        }
        Long id = Long.valueOf(String.valueOf(idObj));
        String reason = params.get("reason") == null ? "" : String.valueOf(params.get("reason")).trim();
        if (reason.isEmpty()) {
            return R.fail("请填写无效原因");
        }
        leadService.markInvalid(id, reason);
        return R.ok();
    }

    /** 公海线索列表(归属 pool) */
    @GetMapping("/pool")
    public R<IPage<CrmLead>> pool(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long poolId,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String customerLevel) {
        return R.ok(leadService.selectPoolPage(pageNum, pageSize, firstText(name, keyword), poolId, source, status, customerLevel));
    }

    /** 我的客资(当前登录人名下、private) */
    @GetMapping("/my")
    public R<IPage<CrmLead>> my(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String followStatus,
            @RequestParam(required = false) String intentLevel,
            @RequestParam(required = false) String customerLevel,
            @RequestParam(required = false) String scope) {
        // scope=all:老板/主管按数据范围看全部/本部门持有客资;员工即使传 all 也只回本人(后端强制收敛)
        return R.ok(leadService.selectMyPage(pageNum, pageSize, firstText(name, keyword), source,
                status, followStatus, firstText(intentLevel, customerLevel), scope));
    }

    /** 今天该打谁:数据范围内、待跟进(逾期/今天到期/从未跟进)的线索 */
    @GetMapping("/todo-follow")
    public R<IPage<CrmLead>> todoFollow(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) String followStatus,
            @RequestParam(required = false) String intentLevel,
            @RequestParam(required = false) String customerLevel,
            @RequestParam(required = false) String scope) {
        return R.ok(leadService.selectTodoFollow(pageNum, pageSize, firstText(name, keyword), source,
                followStatus, firstText(intentLevel, customerLevel), scope));
    }

    /** 回收预警:数据范围内、保护期将在数天内到期的客资,提醒尽快跟进以免被自动回收 */
    @GetMapping("/recycle-warning")
    public R<IPage<CrmLead>> recycleWarning(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer source,
            @RequestParam(required = false) String followStatus,
            @RequestParam(required = false) String intentLevel,
            @RequestParam(required = false) String customerLevel,
            @RequestParam(required = false) String scope) {
        return R.ok(leadService.selectRecycleWarning(pageNum, pageSize, firstText(name, keyword), source,
                followStatus, firstText(intentLevel, customerLevel), scope));
    }

    /** 领取(从公海领到当前登录人名下) */
    @PostMapping("/claim")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> claim(@RequestBody Map<String, Object> body) {
        leadService.claim(toIdList(body.get("ids")));
        return R.ok();
    }

    /** 领取历史客资到本人名下；普通员工限本人，主管按后端数据范围放大。 */
    @PostMapping("/history/reactivate")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> reactivateHistory(@RequestBody Map<String, Object> body) {
        leadService.reactivateHistory(toIdList(body.get("ids")));
        return R.ok();
    }

    /** 退回公海 */
    @PostMapping("/return")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> returnToPool(@RequestBody Map<String, Object> body) {
        Object reason = body.get("reason");
        leadService.returnToPool(toIdList(body.get("ids")), reason == null ? null : reason.toString());
        return R.ok();
    }

    /** 分配(批量指派负责人) */
    @PostMapping("/distribute")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> distribute(@RequestBody Map<String, Object> body) {
        Object ownerId = body.get("ownerId");
        leadService.distribute(toIdList(body.get("ids")), ownerId == null ? null : Long.valueOf(ownerId.toString()));
        return R.ok();
    }

    /** 手动触发自动回收(管理员):立即扫描久未跟进线索回收回公海,返回回收条数。定时任务每日02:00也会自动跑 */
    @PostMapping("/recycle/run")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Integer> runRecycle() {
        if (!SecurityUtils.isCurrentAdmin()) {
            return R.fail(403, "仅管理员可手动触发回收");
        }
        return R.ok(leadService.autoRecycle());
    }

    /** 给线索写跟进:落库跟进记录并回写最后跟进时间/次数(供回收引擎判超时);仅数据范围内可操作 */
    @PostMapping("/{id}/follow")
    @Log(module = "线索管理", type = Log.OperationType.UPDATE)
    public R<Void> follow(@PathVariable Long id, @RequestBody CrmLeadFollowDTO follow) {
        leadService.addFollow(id, follow);
        return R.ok();
    }

    /** 我的销售工作台全量统计,避免前端拿当前页或前1000条冒充总数。 */
    @GetMapping("/workbench-summary")
    public R<Map<String, Object>> workbenchSummary(@RequestParam(required = false) String scope) {
        return R.ok(leadService.workbenchSummary(scope));
    }

    /** 从工商库批量导入企业为公海线索(去重+自动补工商):新公司入池 */
    @PostMapping("/import-companies")
    @Log(module = "线索管理", type = Log.OperationType.INSERT,
            saveRequestData = false, saveResponseData = false)
    public R<Integer> importCompanies(@RequestBody Map<String, Object> body) {
        requireManager("从工商库批量导入线索");
        String keyword = body.get("keyword") == null ? null : body.get("keyword").toString();
        int limit = body.get("limit") == null ? 20 : Integer.parseInt(body.get("limit").toString());
        return R.ok(leadService.importFromCompanyLibrary(keyword, limit));
    }

    /** 公司资源批量导入预检：不写业务数据，返回逐行重复/冲突/错误及一次性确认令牌。 */
    @PostMapping("/import/preflight")
    public R<CrmLeadImportPreviewVO> importPreflight(@Valid @RequestBody CrmLeadImportRequest request) {
        requireManager("批量导入线索");
        return R.ok(leadImportService.preflight(request));
    }

    /** 公司资源批量导入确认：令牌绑定完整预检内容，锁内重新查重后只插入仍可导入行。 */
    @PostMapping("/import/confirm")
    @Log(module = "线索管理", type = Log.OperationType.IMPORT,
            saveRequestData = false, saveResponseData = false)
    public R<CrmLeadImportResultVO> importConfirm(@Valid @RequestBody CrmLeadImportConfirmRequest request) {
        requireManager("批量导入线索");
        return R.ok(leadImportService.confirm(request));
    }

    /** 查重(按手机号/名称) */
    @GetMapping("/duplicate")
    public R<List<CrmLead>> duplicate(
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String name) {
        return R.ok(leadService.checkDuplicate(phone, name));
    }

    /** 线索来源分布(营销统计) */
    @GetMapping("/stats/source")
    public R<List<Map<String, Object>>> sourceStats() {
        return R.ok(leadService.sourceStats());
    }

    /** 线索阶段漏斗(营销统计) */
    @GetMapping("/stats/stage")
    public R<List<Map<String, Object>>> stageStats() {
        return R.ok(leadService.stageStats());
    }

    /** 转化率汇总(数据范围内:电销看自己/主管看部门) */
    @GetMapping("/stats/conversion")
    public R<Map<String, Object>> conversionStats() {
        return R.ok(leadService.conversionSummary());
    }

    /**
     * 投流客资汇总(飞书 164 顶部滚动播报):返回 {month:{...}, year:{...}} 两组聚合。
     * 数据范围内、按 create_time 落本月/本年过滤;每组含有效客资/刻章有效/非刻章有效/
     * 非刻章转化/非刻章转化率/非刻章成交额。
     */
    @GetMapping("/summary")
    public R<Map<String, Object>> summary() {
        return R.ok(leadService.touliuSummary());
    }

    private void requireManager(String action) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            throw new BusinessException(403, "仅主管、老板或管理员可" + action);
        }
    }

    /** 把前端传来的 ids(List<Integer>/List<Long> 等)统一转成 List<Long> */
    private List<Long> toIdList(Object raw) {
        if (!(raw instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream()
                .filter(java.util.Objects::nonNull)
                .map(o -> Long.valueOf(o.toString()))
                .collect(Collectors.toList());
    }

    /** 兼容老前端传 name 与新页面通用搜索传 keyword。 */
    private String firstText(String name, String keyword) {
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return keyword == null ? null : keyword.trim();
    }
}
