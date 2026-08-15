package com.zhehang.erp.modules.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.exception.ErrorCode;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.workflow.domain.dto.WfResubmitDTO;
import com.zhehang.erp.modules.workflow.domain.dto.WfTaskQuery;
import com.zhehang.erp.modules.workflow.domain.entity.WfAttachment;
import com.zhehang.erp.modules.workflow.domain.entity.WfHistory;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.domain.entity.WfProcessDef;
import com.zhehang.erp.modules.workflow.domain.entity.WfProcessVersion;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;
import com.zhehang.erp.modules.workflow.domain.vo.WfAttachmentVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfHistoryVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfInstanceVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfTaskVO;
import com.zhehang.erp.modules.workflow.mapper.WfAttachmentMapper;
import com.zhehang.erp.modules.workflow.mapper.WfHistoryMapper;
import com.zhehang.erp.modules.workflow.mapper.WfInstanceMapper;
import com.zhehang.erp.modules.workflow.mapper.WfProcessDefMapper;
import com.zhehang.erp.modules.workflow.mapper.WfProcessVersionMapper;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import org.springframework.beans.factory.ObjectProvider;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeaveBalance;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveBalanceMapper;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WfInstanceServiceImpl implements IWfInstanceService {

    private final WfProcessDefMapper processDefMapper;
    private final WfProcessVersionMapper versionMapper;
    private final WfInstanceMapper instanceMapper;
    private final WfTaskMapper taskMapper;
    private final WfHistoryMapper historyMapper;
    private final WfAttachmentMapper attachmentMapper;
    private final FileInfoMapper fileInfoMapper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final HrmLeaveBalanceMapper leaveBalanceMapper;
    private final ImBusinessNotificationPublisher notificationPublisher;
    private final ObjectMapper objectMapper;
    /** 业务联动回调处理器(按 bizType 分发;ObjectProvider 允许一个都没有) */
    private final ObjectProvider<ApprovalCallbackHandler> callbackProvider;

    /** 手工补充抄送单次上限，避免异常请求批量制造任务与通知。 */
    private static final int MAX_MANUAL_CC_RECIPIENTS = 50;

    private Long getCurrentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        return userId;
    }

    private void assertTaskAssignee(WfTask task) {
        Long userId = getCurrentUserId();
        if (task.getAssigneeId() != null && !task.getAssigneeId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    @Override
    @Transactional
    public void startProcess(String processKey, String title, Map<String, Object> formData) {
        startProcess(processKey, title, formData, null, null);
    }

    @Override
    @Transactional
    public void startProcess(String processKey, String title, Map<String, Object> formData, String bizType, Long bizId) {
        startProcessAs(processKey, title, formData, bizType, bizId, null);
    }

    @Override
    @Transactional
    public void startProcessAs(String processKey, String title, Map<String, Object> formData, String bizType, Long bizId, Long initiatorId) {
        // 查找已发布的流程定义
        LambdaQueryWrapper<WfProcessDef> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WfProcessDef::getProcessKey, processKey)
                .eq(WfProcessDef::getStatus, 1)
                .orderByDesc(WfProcessDef::getVersion)
                .last("LIMIT 1");
        WfProcessDef processDef = processDefMapper.selectOne(wrapper);
        if (processDef == null) {
            throw new RuntimeException("未找到已发布的流程定义: " + processKey);
        }

        // 发起人:代发起场景用指定发起人(审批链按其部门/上级解析),否则当前登录人
        Long uid = initiatorId != null ? initiatorId : getCurrentUserId();
        if (!StringUtils.hasText(title)) {
            throw new BusinessException("请填写审批标题");
        }
        // 发起范围(submitScope)服务端校验:限定角色/仅管理员的流程,无权的人不能发起
        enforceSubmitScope(processDef, uid, initiatorId != null);
        // 已收编业务的流程强制联动(服务端定死,不信前端传没传):请假批完考勤才认账
        bizType = enforceBizType(processKey, bizType);
        // 防重复提交:同发起人同流程5秒内只受理一单(双击提交出两单)
        assertNoDuplicateSubmit(uid, processDef.getId());
        // 请假:服务端按起止半天重算天数,伪造 days 薅不动年假余额
        recomputeLeaveDays(processKey, formData);
        // 服务端强校验:必填/类型按表单配置来,不信前端
        validateFormData(processDef.getFormConfig(), formData);

        // 绑定发布版本快照:在途流转永远读快照,之后改定义/改节点名不影响本单
        WfProcessVersion snapshot = findOrCreateSnapshot(processDef);

        // 年假余额:请假流程且类型为年假时,先校验剩余并预扣(余额不足抛异常,@Transactional 回滚)
        adjustAnnualLeaveOnStart(processKey, uid, formData);

        // 创建流程实例
        WfInstance instance = new WfInstance();
        instance.setProcessDefId(processDef.getId());
        instance.setProcessVersionId(snapshot.getId());
        instance.setTitle(title);
        instance.setInitiatorId(uid);
        instance.setFormData(toJson(formData));
        instance.setStatus(0); // 进行中
        instance.setStartTime(LocalDateTime.now());
        instance.setBizType(StringUtils.hasText(bizType) ? bizType : null);
        instance.setBizId(bizId);
        instanceMapper.insert(instance);

        // 业务联动:发起回调(可在此创建业务单据并回填 bizId);失败随事务回滚,不留半截
        if (StringUtils.hasText(bizType)) {
            ApprovalCallbackHandler handler = findCallbackHandler(bizType);
            Long createdBizId = handler.onStarted(instance);
            if (createdBizId != null) {
                instance.setBizId(createdBizId);
                instanceMapper.updateById(instance);
            }
        }

        // 附件:真文件走 file 模块只挂引用;禁 base64 进 JSON 列
        saveAttachments(instance, formData);

        // 解析流程配置(读快照)，找到第一个审批节点
        Map<String, Object> processConfig = parseJson(snapshot.getProcessConfig());
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) processConfig.get("nodes");
        List<Map<String, Object>> edges = (List<Map<String, Object>>) processConfig.get("edges");

        if (nodes == null || edges == null) {
            throw new BusinessException("流程配置缺失(无节点/连线),无法发起审批,请联系管理员检查流程设计");
        }

        // 从start节点开始找下一个节点
        String nextNodeId = findNextNodeId("start", edges);
        Map<String, Object> nextNode = findNodeById(nextNodeId, nodes);

        // 处理下一节点（可能是条件节点需要自动判断）
        processNode(instance, nextNode, nodes, edges, formData);

        // 记录历史 - 发起
        recordHistory(instance.getId(), "开始", uid, "start", null);
    }

    /**
     * 已收编业务的流程 → 服务端强制 bizType(前端传不传都一样,防漏联动)。
     * transfer(调岗)不在此强制:通用审批表单没有结构化员工/部门字段,
     * 只有从人事异动单入口发起(显式带 bizType+bizId)才做联动。
     */
    private String enforceBizType(String processKey, String bizType) {
        if ("leave".equals(processKey)) {
            return "hrm_leave";
        }
        if ("expense".equals(processKey)) {
            return "fin_reimburse";
        }
        if ("cost".equals(processKey)) {
            return "fin_expense"; // 业务支出:收编 fin_expense 手工审批
        }
        if ("seal".equals(processKey)) {
            return "admin_seal_use"; // 用章:通过后自动写印章使用登记
        }
        // 付款 payment(无独立业务表)、退款 refund(收编需双轨双写,显式暂不做):保持纯审批
        return bizType;
    }

    /**
     * 请假天数服务端重算:按 startDate+startAmpm ~ endDate+endAmpm 的半天闭区间算,
     * 直接覆盖前端传的 days(WfInstanceServiceImpl 历史上直接信前端 days,可伪造绕过余额校验)。
     * 兼容老格式("2026-07-02 上午"整串在 startDate 里)。
     */
    private void recomputeLeaveDays(String processKey, Map<String, Object> formData) {
        if (!"leave".equals(processKey) || formData == null) {
            return;
        }
        int start = halfSlotOf(formData.get("startDate"), formData.get("startAmpm"), true);
        int end = halfSlotOf(formData.get("endDate"), formData.get("endAmpm"), false);
        if (end < start) {
            throw new BusinessException("请假结束时间不能早于开始时间");
        }
        double days = (end - start + 1) * 0.5;
        formData.put("days", days == Math.floor(days) ? (Object) (long) days : (Object) days);
    }

    /** 日期+半天 → 半天序列绝对下标(整天数*2 + 下午?1:0);默认:开始上午/结束下午 */
    private int halfSlotOf(Object dateObj, Object ampmObj, boolean isStart) {
        String raw = dateObj == null ? null : dateObj.toString().trim();
        if (!StringUtils.hasText(raw)) {
            throw new BusinessException("请假" + (isStart ? "开始" : "结束") + "日期不能为空");
        }
        String ampm = ampmObj == null ? null : ampmObj.toString().trim();
        String day = raw;
        if (raw.length() > 10) { // 老格式"2026-07-02 上午"
            String[] parts = raw.split("\\s+");
            day = parts[0];
            if (parts.length > 1 && !StringUtils.hasText(ampm)) {
                ampm = parts[1];
            }
        }
        java.time.LocalDate d;
        try {
            d = java.time.LocalDate.parse(day.substring(0, 10));
        } catch (Exception e) {
            throw new BusinessException("请假日期格式无效: " + raw);
        }
        boolean pm = StringUtils.hasText(ampm) ? "下午".equals(ampm) : !isStart;
        return (int) (d.toEpochDay() * 2 + (pm ? 1 : 0));
    }

    /**
     * 撤回策略:
     * - status=4(待修改)不受策略限制,发起人随时可撤(不在流转中);
     * - status=0 且尚无任一节点通过(首节点前):看 allowWithdrawBeforeApproval;
     * - status=0 且已有节点通过:看 allowWithdrawAfterApproval + withdrawDays 天窗口。
     * 兼容:settings 缺失/无相关键时保持旧行为(允许撤销),只在显式设 false/超窗口时才拦。
     */
    private void enforceWithdrawPolicy(WfInstance instance) {
        if (instance.getStatus() != null && instance.getStatus() == 4) {
            return;
        }
        Map<String, Object> settings = readProcessSettings(instanceConfigJson(instance,
                processDefMapper.selectById(instance.getProcessDefId())));
        if (settings.isEmpty()) {
            return; // 老流程无设置:保持旧行为
        }
        boolean anyApproved = historyMapper.selectCount(new LambdaQueryWrapper<WfHistory>()
                .eq(WfHistory::getInstanceId, instance.getId())
                .eq(WfHistory::getAction, "approve")) > 0;
        if (!anyApproved) {
            // 首节点通过前:仅当显式关闭"通过前撤销"才拦
            if (settings.containsKey("allowWithdrawBeforeApproval")
                    && !boolVal(settings.get("allowWithdrawBeforeApproval"))) {
                throw new BusinessException("该审批不允许在首个审批节点通过前撤销");
            }
            return;
        }
        // 已有节点通过:需允许"通过后撤销"且在 withdrawDays 天内
        if (settings.containsKey("allowWithdrawAfterApproval")
                && !boolVal(settings.get("allowWithdrawAfterApproval"))) {
            throw new BusinessException("该审批已有节点通过,不允许撤销");
        }
        if (settings.containsKey("allowWithdrawAfterApproval") && instance.getStartTime() != null) {
            int days = intVal(settings.get("withdrawDays"), 31);
            if (instance.getStartTime().plusDays(days).isBefore(LocalDateTime.now())) {
                throw new BusinessException("已超过发起后 " + days + " 天的可撤销期限");
            }
        }
    }

    private boolean boolVal(Object o) {
        return o != null && Boolean.parseBoolean(o.toString());
    }

    private int intVal(Object o, int dft) {
        try {
            return (int) Double.parseDouble(o.toString().trim());
        } catch (Exception e) {
            return dft;
        }
    }

    /** 读流程定义 process_config 里的 settings 对象(设计器第4步"更多设置");无则空 */
    @SuppressWarnings("unchecked")
    private Map<String, Object> readProcessSettings(String processConfigJson) {
        try {
            Map<String, Object> cfg = parseJson(processConfigJson);
            Object s = cfg.get("settings");
            return s instanceof Map ? (Map<String, Object>) s : Collections.emptyMap();
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    /**
     * 发起范围校验:submitScope=all 全员;admin 仅管理员/老板/HR;role 仅 submitRoles 里的角色。
     * 代发起(initiatorId 指定,如调岗以被调岗员工身份发起)豁免——由建单入口自己控权。
     */
    @SuppressWarnings("unchecked")
    private void enforceSubmitScope(WfProcessDef def, Long uid, boolean delegated) {
        if (delegated) {
            return;
        }
        Map<String, Object> settings = readProcessSettings(def.getProcessConfig());
        Object scopeObj = settings.get("submitScope");
        String scope = scopeObj == null ? "all" : scopeObj.toString();
        if ("all".equals(scope) || !StringUtils.hasText(scope)) {
            return;
        }
        if ("admin".equals(scope)) {
            if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "hr")) {
                return;
            }
            throw new BusinessException("该审批仅管理员可发起,你没有发起权限");
        }
        if ("role".equals(scope)) {
            List<String> roles = new ArrayList<>();
            Object rr = settings.get("submitRoles");
            if (rr instanceof List) {
                for (Object o : (List<?>) rr) {
                    if (o != null) {
                        roles.add(o.toString());
                    }
                }
            }
            if (roles.isEmpty()) {
                return; // 配了 role 却没选角色 → 视为不限制,不误伤
            }
            if (SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole(roles.toArray(new String[0]))) {
                return;
            }
            throw new BusinessException("该审批限指定角色发起,你不在允许发起的角色内");
        }
    }

    /** 同发起人同流程5秒内已提交过 → 拒绝(防双击/重复点击出两单) */
    private void assertNoDuplicateSubmit(Long userId, Long processDefId) {
        Long recent = instanceMapper.selectCount(new LambdaQueryWrapper<WfInstance>()
                .eq(WfInstance::getInitiatorId, userId)
                .eq(WfInstance::getProcessDefId, processDefId)
                .ge(WfInstance::getStartTime, LocalDateTime.now().minusSeconds(5)));
        if (recent != null && recent > 0) {
            throw new BusinessException("刚刚已提交过同类申请,请勿重复提交(如需再发请稍候5秒)");
        }
    }

    /**
     * 服务端表单强校验:按 formConfig 校验必填与数字类型。
     * 说明文字/附件字段不参与;附件必填由 __attachmentFileIds 判断。
     */
    @SuppressWarnings("unchecked")
    private void validateFormData(String formConfigJson, Map<String, Object> formData) {
        List<Map<String, Object>> fields;
        try {
            if (!StringUtils.hasText(formConfigJson)) {
                return;
            }
            fields = objectMapper.readValue(formConfigJson, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return; // 表单配置坏了不拦发起,发布预检负责挡坏配置
        }
        Map<String, Object> data = formData == null ? Collections.emptyMap() : formData;
        for (Map<String, Object> f : fields) {
            String field = f.get("field") == null ? null : f.get("field").toString();
            String type = f.get("type") == null ? "" : f.get("type").toString();
            String label = f.get("label") == null ? field : f.get("label").toString();
            boolean required = Boolean.parseBoolean(String.valueOf(f.get("required")));
            if (field == null || "description".equals(type)) {
                continue;
            }
            Object v = "attachment".equals(type) ? data.get("__attachmentFileIds") : data.get(field);
            boolean empty = v == null || (v instanceof String && !StringUtils.hasText((String) v))
                    || (v instanceof List && ((List<?>) v).isEmpty());
            if (required && empty) {
                throw new BusinessException("「" + label + "」为必填项,请填写后再提交");
            }
            if (!empty && ("number".equals(type) || "amount".equals(type))) {
                try {
                    double d = Double.parseDouble(v.toString().trim());
                    if (d < 0) {
                        throw new NumberFormatException("negative");
                    }
                } catch (NumberFormatException e) {
                    throw new BusinessException("「" + label + "」必须是不小于0的数字");
                }
            }
        }
    }

    /** 取该定义当前版本的快照;老定义(未走新发布逻辑)没有快照则现场补一份 */
    private WfProcessVersion findOrCreateSnapshot(WfProcessDef def) {
        WfProcessVersion snapshot = versionMapper.selectOne(new LambdaQueryWrapper<WfProcessVersion>()
                .eq(WfProcessVersion::getProcessDefId, def.getId())
                .eq(WfProcessVersion::getVersion, def.getVersion())
                .last("LIMIT 1"));
        if (snapshot != null) {
            return snapshot;
        }
        snapshot = new WfProcessVersion();
        snapshot.setProcessDefId(def.getId());
        snapshot.setVersion(def.getVersion());
        snapshot.setName(def.getName());
        snapshot.setFormConfig(def.getFormConfig());
        snapshot.setProcessConfig(def.getProcessConfig());
        snapshot.setPublishBy(def.getUpdateBy());
        snapshot.setPublishTime(LocalDateTime.now());
        versionMapper.insert(snapshot);
        return snapshot;
    }

    /**
     * 附件落库:form_data 只允许存文件ID数组(__attachmentFileIds);
     * 老前端的 __attachments(base64) 一律拒绝,防 8MB 文件≈11MB base64 全量进 JSON 列。
     */
    @SuppressWarnings("unchecked")
    private void saveAttachments(WfInstance instance, Map<String, Object> formData) {
        if (formData == null) {
            return;
        }
        Object legacy = formData.get("__attachments");
        if (legacy instanceof List && !((List<?>) legacy).isEmpty()) {
            throw new BusinessException("附件请通过文件上传方式提交(不支持内嵌图片数据),请刷新页面后重新上传附件");
        }
        Object idsObj = formData.get("__attachmentFileIds");
        if (!(idsObj instanceof List) || ((List<?>) idsObj).isEmpty()) {
            return;
        }
        Long uid = getCurrentUserId();
        for (Object o : (List<?>) idsObj) {
            long fileId;
            try {
                fileId = Long.parseLong(o.toString());
            } catch (Exception e) {
                throw new BusinessException("附件ID无效: " + o);
            }
            FileInfo file = fileInfoMapper.selectById(fileId);
            if (file == null) {
                throw new BusinessException("附件文件不存在或已删除(ID=" + fileId + "),请重新上传");
            }
            WfAttachment att = new WfAttachment();
            att.setInstanceId(instance.getId());
            att.setFileId(fileId);
            att.setFileName(StringUtils.hasText(file.getOriginalName()) ? file.getOriginalName() : file.getName());
            att.setFileSize(file.getFileSize());
            att.setMimeType(file.getMimeType());
            att.setUploadBy(uid);
            attachmentMapper.insert(att);
        }
    }

    /** 实例的流程配置JSON:优先读绑定的版本快照,老实例(无快照)回退当前定义 */
    private String instanceConfigJson(WfInstance instance, WfProcessDef def) {
        if (instance.getProcessVersionId() != null) {
            WfProcessVersion v = versionMapper.selectById(instance.getProcessVersionId());
            if (v != null && StringUtils.hasText(v.getProcessConfig())) {
                return v.getProcessConfig();
            }
        }
        if (def != null && StringUtils.hasText(def.getProcessConfig())) {
            return def.getProcessConfig();
        }
        throw new BusinessException("流程配置缺失(实例无快照且定义无配置),请联系管理员");
    }

    /** 实例的表单配置JSON:优先快照,回退定义;都没有返回 null */
    private String instanceFormConfigJson(WfInstance instance, WfProcessDef def) {
        if (instance.getProcessVersionId() != null) {
            WfProcessVersion v = versionMapper.selectById(instance.getProcessVersionId());
            if (v != null && StringUtils.hasText(v.getFormConfig())) {
                return v.getFormConfig();
            }
        }
        return def != null ? def.getFormConfig() : null;
    }

    /** 当前任务所在节点ID:新任务直接带 node_id;老任务回退按节点名反查 */
    private String locateNodeId(WfTask task, List<Map<String, Object>> nodes) {
        if (StringUtils.hasText(task.getNodeId())) {
            return task.getNodeId();
        }
        return findNodeIdByName(task.getNodeName(), nodes);
    }

    // ===== 年假余额(仅 processKey=leave 且 leaveType=年假) =====
    /** 发起请假:若该(员工,假期类型)设了额度则校验剩余并预扣;余额不足抛异常;未设额度不限制 */
    private void adjustAnnualLeaveOnStart(String processKey, Long userId, Map<String, Object> formData) {
        if (!"leave".equals(processKey) || formData == null) {
            return;
        }
        Object type = formData.get("leaveType");
        if (type == null || !StringUtils.hasText(type.toString())) {
            return;
        }
        String leaveType = type.toString();
        double days = parseDays(formData.get("days"));
        if (days <= 0) {
            return;
        }
        OrgEmployee emp = findEmpByUser(userId);
        if (emp == null) {
            return; // 无员工档案 → 不做额度限制
        }
        HrmLeaveBalance bal = findBalance(emp.getId(), leaveType);
        if (bal == null) {
            return; // 该假期类型未设额度 → 不限制(如事假/病假)
        }
        double total = bal.getTotalDays() == null ? 0 : bal.getTotalDays();
        double used = bal.getUsedDays() == null ? 0 : bal.getUsedDays();
        double remaining = total - used;
        if (days > remaining + 1e-6) {
            throw new BusinessException(leaveType + "余额不足:剩余 " + fmt(remaining) + " 天,本次申请 " + fmt(days) + " 天");
        }
        bal.setUsedDays(used + days);
        leaveBalanceMapper.updateById(bal);
    }

    /** 驳回/撤销请假:退还预扣的额度 */
    private void refundAnnualLeave(WfInstance instance) {
        if (instance == null) {
            return;
        }
        WfProcessDef def = processDefMapper.selectById(instance.getProcessDefId());
        if (def == null || !"leave".equals(def.getProcessKey())) {
            return;
        }
        Map<String, Object> formData = parseJson(instance.getFormData());
        if (formData == null) {
            return;
        }
        Object type = formData.get("leaveType");
        if (type == null || !StringUtils.hasText(type.toString())) {
            return;
        }
        String leaveType = type.toString();
        double days = parseDays(formData.get("days"));
        if (days <= 0) {
            return;
        }
        OrgEmployee emp = findEmpByUser(instance.getInitiatorId());
        if (emp == null) {
            return;
        }
        HrmLeaveBalance bal = findBalance(emp.getId(), leaveType);
        if (bal == null) {
            return;
        }
        double used = bal.getUsedDays() == null ? 0 : bal.getUsedDays();
        bal.setUsedDays(Math.max(0, used - days));
        leaveBalanceMapper.updateById(bal);
    }

    private HrmLeaveBalance findBalance(Long employeeId, String leaveType) {
        if (employeeId == null || leaveType == null) {
            return null;
        }
        return leaveBalanceMapper.selectOne(new LambdaQueryWrapper<HrmLeaveBalance>()
                .eq(HrmLeaveBalance::getEmployeeId, employeeId)
                .eq(HrmLeaveBalance::getLeaveType, leaveType)
                .last("limit 1"));
    }

    private OrgEmployee findEmpByUser(Long userId) {
        if (userId == null) {
            return null;
        }
        return orgEmployeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getUserId, userId)
                .orderByDesc(OrgEmployee::getId)
                .last("limit 1"));
    }

    /** 用户ID → 展示姓名:优先员工档案真实姓名,其次账号昵称,最后登录名(避免审批里显示"用户10"这种代号) */
    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        OrgEmployee emp = findEmpByUser(userId);
        if (emp != null && StringUtils.hasText(emp.getName())) {
            return emp.getName();
        }
        SysUser u = userMapper.selectById(userId);
        if (u == null) {
            return null;
        }
        return StringUtils.hasText(u.getNickname()) ? u.getNickname() : u.getUsername();
    }

    /** 批量版 resolveUserName(列表场景用,消除 N+1):userId → 展示姓名 */
    private Map<Long, String> buildUserNameMap(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<Long, String> map = new HashMap<>();
        // 先用员工档案真实姓名(user_id → name)
        for (OrgEmployee e : orgEmployeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .in(OrgEmployee::getUserId, userIds))) {
            if (e.getUserId() != null && StringUtils.hasText(e.getName())) {
                map.putIfAbsent(e.getUserId(), e.getName());
            }
        }
        // 无档案的回退账号昵称/登录名
        List<Long> missing = userIds.stream().filter(id -> !map.containsKey(id)).collect(Collectors.toList());
        if (!missing.isEmpty()) {
            for (SysUser u : userMapper.selectBatchIds(missing)) {
                map.put(u.getId(), StringUtils.hasText(u.getNickname()) ? u.getNickname() : u.getUsername());
            }
        }
        return map;
    }

    private double parseDays(Object o) {
        if (o == null) {
            return 0;
        }
        try {
            return Double.parseDouble(o.toString().trim());
        } catch (Exception e) {
            return 0;
        }
    }

    private String fmt(double d) {
        return d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d);
    }

    @Override
    @Transactional
    public void approve(Long taskId, String comment) {
        WfTask task = taskMapper.selectById(taskId);
        if (task == null || task.getStatus() != 0) {
            throw new RuntimeException("任务不存在或已处理");
        }
        assertTaskAssignee(task);

        // 串行化同一实例的并发审批,防止会签死锁/或签重复推进
        instanceMapper.lockInstance(task.getInstanceId());

        // 原子认领:仅当任务仍待处理(status=0)时才置为通过,杜绝并发重复处理
        int claimed = taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, task.getId())
                .eq(WfTask::getStatus, 0)
                .set(WfTask::getStatus, 1)
                .set(WfTask::getComment, comment)
                .set(WfTask::getHandleTime, LocalDateTime.now()));
        if (claimed == 0) {
            throw new RuntimeException("任务不存在或已处理");
        }

        // 记录历史
        recordHistory(task.getInstanceId(), task.getNodeName(), getCurrentUserId(), "approve", comment);

        // 查找流程实例和定义
        WfInstance instance = instanceMapper.selectById(task.getInstanceId());
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        WfProcessDef processDef = processDefMapper.selectById(instance.getProcessDefId());
        // 读实例绑定的版本快照(而非当前定义):停用/改名/改链后在途单照走原快照
        Map<String, Object> processConfig = parseJson(instanceConfigJson(instance, processDef));
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) processConfig.get("nodes");
        List<Map<String, Object>> edges = (List<Map<String, Object>>) processConfig.get("edges");

        if (nodes == null || edges == null) {
            throw new BusinessException("流程配置缺失,无法继续审批,请联系管理员");
        }

        // 当前节点:按任务的 node_id 定位(老任务回退按节点名)
        String currentNodeId = locateNodeId(task, nodes);
        if (currentNodeId == null) {
            throw new BusinessException("流程快照里找不到当前节点[" + task.getNodeName() + "],请联系管理员");
        }

        // 会签/或签:判断本节点是否完成
        Map<String, Object> curNode = findNodeById(currentNodeId, nodes);
        String signMode = curNode != null ? (String) curNode.get("signMode") : null;
        List<WfTask> siblings = selectSiblingTasks(instance.getId(), task);
        if ("and".equals(signMode)) {
            // 会签:还有待处理的会签人 → 等待,不往下走
            boolean anyPending = siblings.stream().anyMatch(t -> t.getStatus() != null && t.getStatus() == 0);
            if (anyPending) {
                return;
            }
        } else {
            // 或签/单审批人:本次通过即完成,其余待处理任务作废(status=5,不再与"拒绝"共用2)
            voidPendingSiblings(siblings, task.getId());
        }

        String nextNodeId = findNextNodeId(currentNodeId, edges);

        if (nextNodeId == null) {
            // 没有下一个节点，流程结束
            completeInstance(instance);
            return;
        }

        Map<String, Object> nextNode = findNodeById(nextNodeId, nodes);
        if (nextNode == null) {
            completeInstance(instance);
            return;
        }

        // 解析表单数据用于条件判断
        Map<String, Object> formData = parseJson(instance.getFormData());
        processNode(instance, nextNode, nodes, edges, formData);
    }

    @Override
    @Transactional
    public void reject(Long taskId, String comment) {
        WfTask task = taskMapper.selectById(taskId);
        if (task == null || task.getStatus() != 0) {
            throw new RuntimeException("任务不存在或已处理");
        }
        assertTaskAssignee(task);

        // 串行化同一实例的并发操作
        instanceMapper.lockInstance(task.getInstanceId());

        // 原子认领:仅当任务仍待处理时置为已拒绝
        int claimed = taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, task.getId())
                .eq(WfTask::getStatus, 0)
                .set(WfTask::getStatus, 2)
                .set(WfTask::getComment, comment)
                .set(WfTask::getHandleTime, LocalDateTime.now()));
        if (claimed == 0) {
            throw new RuntimeException("任务不存在或已处理");
        }

        recordHistory(task.getInstanceId(), task.getNodeName(), getCurrentUserId(), "reject", comment);

        WfInstance instance = instanceMapper.selectById(task.getInstanceId());
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        // 任一审批人驳回即终止本节点(飞书语义):作废本节点其余待处理任务(status=5,他们并没有拒绝)
        voidPendingSiblings(selectSiblingTasks(instance.getId(), task), task.getId());

        // 实例驳回
        instance.setStatus(2); // 已拒绝
        instance.setEndTime(LocalDateTime.now());
        instanceMapper.updateById(instance);

        // 业务联动:驳回回写(失败随事务回滚)
        dispatchCallback(instance, "rejected");

        // 年假:驳回时退还预扣天数
        refundAnnualLeave(instance);

        // 抄送:驳回也抄送(让抄送人知道结果,不只在通过时抄送)
        createCarbonCopies(instance);

        // 与审批状态同事务登记 IM outbox，失败即回滚本次拒绝。
        String rejectedContent = "你发起的「" + instance.getTitle() + "」被拒绝"
                + (StringUtils.hasText(comment) ? ",理由:" + comment : "");
        notifyWorkflow(instance.getInitiatorId(), instance,
                "workflow:" + instance.getId() + ":rejected:" + task.getId(),
                "workflow.rejected", "rejected", "审批被拒绝", rejectedContent,
                StringUtils.hasText(comment) ? "请按拒绝原因处理：" + comment : "请查看审批结果",
                "查看结果", "/approval/center?tab=started", true);
    }

    @Override
    @Transactional
    public void transfer(Long taskId, Long targetUserId, String comment) {
        WfTask task = taskMapper.selectById(taskId);
        if (task == null || task.getStatus() != 0) {
            throw new RuntimeException("任务不存在或已处理");
        }
        assertTaskAssignee(task);
        // 校验转交目标是已开通账号的用户:否则会建一条永远无人处理的待办把实例卡死
        if (targetUserId == null) {
            throw new BusinessException("请选择转交对象");
        }
        SysUser target = userMapper.selectById(targetUserId);
        if (target == null || target.getStatus() == null || target.getStatus() != 0) {
            throw new BusinessException("转交对象账号不存在或已停用,请重新选择");
        }
        if (targetUserId.equals(getCurrentUserId())) {
            throw new BusinessException("不能转交给自己");
        }

        // 串行化同一实例的并发操作
        instanceMapper.lockInstance(task.getInstanceId());

        // 原子认领:仅当任务仍待处理(status=0)时才置为已转交,杜绝并发重复转交
        int claimed = taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, task.getId())
                .eq(WfTask::getStatus, 0)
                .set(WfTask::getStatus, 3)
                .set(WfTask::getComment, comment)
                .set(WfTask::getHandleTime, LocalDateTime.now()));
        if (claimed == 0) {
            throw new RuntimeException("任务不存在或已处理");
        }

        // 创建新任务给目标用户(继承节点定位与审批时限)
        WfTask newTask = new WfTask();
        newTask.setInstanceId(task.getInstanceId());
        newTask.setNodeName(task.getNodeName());
        newTask.setNodeId(task.getNodeId());
        newTask.setNodeType(task.getNodeType());
        newTask.setAssigneeId(targetUserId);
        newTask.setDeadline(task.getDeadline());
        newTask.setStatus(0);
        taskMapper.insert(newTask);

        recordHistory(task.getInstanceId(), task.getNodeName(), getCurrentUserId(), "transfer", comment);

        // 站内信:告知被转交人有新待办
        WfInstance inst = instanceMapper.selectById(task.getInstanceId());
        if (inst != null) {
            String transferContent = safeName(getCurrentUserId()) + "把「" + inst.getTitle() + "」转交给你审批"
                    + buildFormSummary(parseJsonQuietly(inst.getFormData()));
            notifyWorkflow(targetUserId, inst,
                    "workflow:" + inst.getId() + ":transferred:" + newTask.getId(),
                    "workflow.transferred", "pending", "待你审批(转交)", transferContent,
                    "请及时查看并处理转交给你的审批", "去审批", "/approval/center?tab=todo", true);
        }
    }

    /**
     * 退回修改:审批人把申请退回给发起人改表单(不是拒绝)。
     * 实例转 status=4 待修改,本节点其余待办作废,发起人收到通知后可修改并重新提交。
     */
    @Override
    @Transactional
    public void returnForRevision(Long taskId, String comment) {
        if (!StringUtils.hasText(comment)) {
            throw new BusinessException("退回必须填写修改意见,发起人才知道要改什么");
        }
        WfTask task = taskMapper.selectById(taskId);
        if (task == null || task.getStatus() != 0) {
            throw new RuntimeException("任务不存在或已处理");
        }
        assertTaskAssignee(task);

        // 串行化同一实例的并发操作
        instanceMapper.lockInstance(task.getInstanceId());

        // 原子认领:仅当任务仍待处理时置为已退回(status=6)
        int claimed = taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, task.getId())
                .eq(WfTask::getStatus, 0)
                .set(WfTask::getStatus, 6)
                .set(WfTask::getComment, comment)
                .set(WfTask::getHandleTime, LocalDateTime.now()));
        if (claimed == 0) {
            throw new RuntimeException("任务不存在或已处理");
        }

        WfInstance instance = instanceMapper.selectById(task.getInstanceId());
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }

        // 本节点其余待办作废
        voidPendingSiblings(selectSiblingTasks(instance.getId(), task), task.getId());

        recordHistory(instance.getId(), task.getNodeName(), getCurrentUserId(), "return", comment);

        // 实例转待修改
        instance.setStatus(4);
        instanceMapper.updateById(instance);

        // 年假:退回时先退还预扣天数,重新提交时按新表单再扣
        refundAnnualLeave(instance);

        String returnedContent = "你发起的「" + instance.getTitle() + "」被退回修改,原因:"
                + comment + "。请修改后重新提交";
        notifyWorkflow(instance.getInitiatorId(), instance,
                "workflow:" + instance.getId() + ":returned:" + task.getId(),
                "workflow.returned", "returned", "审批被退回修改", returnedContent,
                "请按退回意见修改后重新提交", "去修改", "/approval/center?tab=started", true);
    }

    /**
     * 重新提交:发起人修改被退回(status=4)的申请后,从头重新流转。
     * 表单校验/年假预扣/附件与首次发起同一套规则;流程仍走本实例绑定的版本快照。
     */
    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public void resubmit(Long instanceId, WfResubmitDTO dto) {
        WfInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException("流程实例不存在");
        }
        Long uid = getCurrentUserId();
        if (!Objects.equals(instance.getInitiatorId(), uid)) {
            throw new BusinessException("只有发起人可以重新提交");
        }
        if (instance.getStatus() == null || instance.getStatus() != 4) {
            throw new BusinessException("只有被退回(待修改)的申请可以重新提交");
        }
        if (dto == null || dto.getFormData() == null) {
            throw new BusinessException("请提交修改后的表单内容");
        }

        instanceMapper.lockInstance(instanceId);

        WfProcessDef def = processDefMapper.selectById(instance.getProcessDefId());
        String processKey = def != null ? def.getProcessKey() : null;
        // 请假:重提同样服务端重算天数,不信前端
        recomputeLeaveDays(processKey, dto.getFormData());
        String formConfig = instanceFormConfigJson(instance, def);
        validateFormData(formConfig, dto.getFormData());

        // 年假:按新表单重新预扣(退回时已退还)
        adjustAnnualLeaveOnStart(processKey, uid, dto.getFormData());

        // 更新表单/标题,重挂附件
        if (StringUtils.hasText(dto.getTitle())) {
            instance.setTitle(dto.getTitle());
        }
        instance.setFormData(toJson(dto.getFormData()));
        instance.setStatus(0);
        instance.setEndTime(null);
        instanceMapper.updateById(instance);

        attachmentMapper.delete(new LambdaQueryWrapper<WfAttachment>()
                .eq(WfAttachment::getInstanceId, instanceId));
        saveAttachments(instance, dto.getFormData());

        // 业务联动:同步业务单据内容并回到待审(失败随事务回滚)
        if (StringUtils.hasText(instance.getBizType())) {
            findCallbackHandler(instance.getBizType()).onResubmitted(instance);
        }

        recordHistory(instanceId, "重新提交", uid, "resubmit", null);

        // 从头重新流转(读实例绑定的快照)
        Map<String, Object> processConfig = parseJson(instanceConfigJson(instance, def));
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) processConfig.get("nodes");
        List<Map<String, Object>> edges = (List<Map<String, Object>>) processConfig.get("edges");
        if (nodes == null || edges == null) {
            throw new BusinessException("流程配置缺失,无法重新提交,请联系管理员");
        }
        String nextNodeId = findNextNodeId("start", edges);
        processNode(instance, findNodeById(nextNodeId, nodes), nodes, edges, dto.getFormData());
    }

    /** 催办:发起人提醒当前审批人;同一任务4小时内只允许催一次 */
    @Override
    @Transactional
    public void urge(Long taskId) {
        WfTask task = taskMapper.selectById(taskId);
        if (task == null || task.getStatus() == null || task.getStatus() != 0) {
            throw new BusinessException("该任务已处理,无需催办");
        }
        WfInstance instance = instanceMapper.selectById(task.getInstanceId());
        if (instance == null) {
            throw new BusinessException("流程实例不存在");
        }
        Long uid = getCurrentUserId();
        if (!Objects.equals(instance.getInitiatorId(), uid)) {
            throw new BusinessException("只有发起人可以催办");
        }
        // 限频:同实例同节点4小时内已催过 → 拒绝
        Long recent = historyMapper.selectCount(new LambdaQueryWrapper<WfHistory>()
                .eq(WfHistory::getInstanceId, instance.getId())
                .eq(WfHistory::getAction, "urge")
                .eq(WfHistory::getNodeName, task.getNodeName())
                .ge(WfHistory::getOperTime, LocalDateTime.now().minusHours(4)));
        if (recent != null && recent > 0) {
            throw new BusinessException("4小时内已催办过,请耐心等待审批人处理");
        }
        Long urgeHistoryId = recordHistory(instance.getId(), task.getNodeName(), uid, "urge", null);
        String urgeContent = safeName(uid) + "催办:「" + instance.getTitle() + "」还在等你审批,请尽快处理"
                + buildFormSummary(parseJsonQuietly(instance.getFormData()));
        notifyWorkflow(task.getAssigneeId(), instance,
                "workflow:" + instance.getId() + ":urged:" + urgeHistoryId,
                "workflow.urged", "pending", "催办提醒", urgeContent,
                "请尽快完成当前审批", "去审批", "/approval/center?tab=todo", true);
    }

    /** 四个列表一次性计数(角标用):待办/已办/抄送我/已发起 */
    @Override
    public Map<String, Long> myCounts() {
        Long uid = getCurrentUserId();
        Map<String, Long> counts = new HashMap<>();
        counts.put("todo", taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getAssigneeId, uid).eq(WfTask::getStatus, 0)));
        counts.put("done", taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getAssigneeId, uid).ne(WfTask::getNodeType, "cc")
                .in(WfTask::getStatus, 1, 2, 3, 6)));
        // 抄送角标 = 未读抄送数(read_flag=0 或历史 NULL);进"抄送我"页后逐条标已读清零
        counts.put("cc", taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getAssigneeId, uid).eq(WfTask::getNodeType, "cc")
                .and(w -> w.isNull(WfTask::getReadFlag).or().eq(WfTask::getReadFlag, 0))));
        counts.put("started", instanceMapper.selectCount(new LambdaQueryWrapper<WfInstance>()
                .eq(WfInstance::getInitiatorId, uid)));
        return counts;
    }

    /** 全公司审批监控(权限门禁在 Controller):可按状态/发起人/关键字/流程/时间段筛,带当前节点与时限供前端标超时 */
    @Override
    public IPage<WfInstanceVO> adminList(WfTaskQuery query, Integer status, Long initiatorId) {
        Page<WfInstance> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<WfInstance> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(WfInstance::getStatus, status);
        }
        if (initiatorId != null) {
            wrapper.eq(WfInstance::getInitiatorId, initiatorId);
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(WfInstance::getTitle, query.getKeyword());
        }
        if (StringUtils.hasText(query.getProcessKey())) {
            List<Long> defIds = processDefMapper.selectList(new LambdaQueryWrapper<WfProcessDef>()
                            .eq(WfProcessDef::getProcessKey, query.getProcessKey()))
                    .stream().map(WfProcessDef::getId).collect(Collectors.toList());
            if (defIds.isEmpty()) {
                return new Page<>(query.getPageNum(), query.getPageSize());
            }
            wrapper.in(WfInstance::getProcessDefId, defIds);
        }
        if (StringUtils.hasText(query.getStartDate())) {
            wrapper.ge(WfInstance::getStartTime, query.getStartDate() + " 00:00:00");
        }
        if (StringUtils.hasText(query.getEndDate())) {
            wrapper.le(WfInstance::getStartTime, query.getEndDate() + " 23:59:59");
        }
        wrapper.orderByDesc(WfInstance::getStartTime);
        IPage<WfInstance> result = instanceMapper.selectPage(page, wrapper);

        Page<WfInstanceVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        List<Long> defIds = result.getRecords().stream()
                .map(WfInstance::getProcessDefId).filter(Objects::nonNull).distinct().collect(Collectors.toList());
        Map<Long, WfProcessDef> defMap = defIds.isEmpty() ? Collections.emptyMap()
                : processDefMapper.selectBatchIds(defIds).stream()
                        .collect(Collectors.toMap(WfProcessDef::getId, d -> d, (a, b) -> a));
        Map<Long, String> nameMap = buildUserNameMap(result.getRecords().stream()
                .map(WfInstance::getInitiatorId).filter(Objects::nonNull).distinct().collect(Collectors.toList()));
        // 进行中实例的当前待办(节点/处理人/时限):一次查回按实例分组,监控列表标超时用
        List<Long> runningIds = result.getRecords().stream()
                .filter(i -> i.getStatus() != null && i.getStatus() == 0)
                .map(WfInstance::getId).collect(Collectors.toList());
        Map<Long, WfTask> currentTaskMap = new HashMap<>();
        if (!runningIds.isEmpty()) {
            for (WfTask t : taskMapper.selectList(new LambdaQueryWrapper<WfTask>()
                    .in(WfTask::getInstanceId, runningIds).eq(WfTask::getStatus, 0))) {
                currentTaskMap.putIfAbsent(t.getInstanceId(), t);
            }
        }
        Map<Long, String> assigneeNameMap = buildUserNameMap(currentTaskMap.values().stream()
                .map(WfTask::getAssigneeId).filter(Objects::nonNull).distinct().collect(Collectors.toList()));
        voPage.setRecords(result.getRecords().stream().map(inst -> {
            WfInstanceVO vo = new WfInstanceVO();
            BeanUtils.copyProperties(inst, vo);
            WfProcessDef def = defMap.get(inst.getProcessDefId());
            if (def != null) {
                vo.setProcessName(def.getName());
                // 卡片按 formConfig 解析字段中文名;缺了它,设计器自建流程的生成键(field_xxx)会裸露(与 getMyStarted 一致)
                vo.setFormConfig(def.getFormConfig());
            }
            vo.setInitiatorName(nameMap.get(inst.getInitiatorId()));
            WfTask cur = currentTaskMap.get(inst.getId());
            if (cur != null) {
                vo.setCurrentNodeName(cur.getNodeName());
                vo.setCurrentTaskId(cur.getId());
                vo.setCurrentTaskDeadline(cur.getDeadline());
                vo.setCurrentAssigneeName(assigneeNameMap.get(cur.getAssigneeId()));
            }
            return vo;
        }).collect(Collectors.toList()));
        return voPage;
    }

    @Override
    @Transactional
    public void cancel(Long instanceId) {
        WfInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        if (!instance.getInitiatorId().equals(getCurrentUserId())) {
            throw new RuntimeException("只有发起人可以撤销流程");
        }
        if (instance.getStatus() != 0 && instance.getStatus() != 4) {
            throw new RuntimeException("只能撤销进行中或待修改的流程");
        }
        // 撤回策略(设计器"提交人权限"):按流程 settings 判断是否允许撤销及天数窗口
        enforceWithdrawPolicy(instance);

        instance.setStatus(3); // 已撤销
        instance.setEndTime(LocalDateTime.now());
        instanceMapper.updateById(instance);

        // 业务联动:撤销回写(失败随事务回滚)
        dispatchCallback(instance, "cancelled");

        // 年假:撤销时退还预扣天数
        refundAnnualLeave(instance);

        // 取消所有待处理的任务
        LambdaQueryWrapper<WfTask> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.eq(WfTask::getInstanceId, instanceId).eq(WfTask::getStatus, 0);
        List<WfTask> pendingTasks = taskMapper.selectList(taskWrapper);
        for (WfTask t : pendingTasks) {
            t.setStatus(5); // 已作废(撤销导致,不与"拒绝"共用状态码)
            t.setHandleTime(LocalDateTime.now());
            taskMapper.updateById(t);
            // 每个待办使用自身任务ID，重复撤销不会重复登记同一事件。
            String cancelledContent = safeName(instance.getInitiatorId()) + "已撤销「"
                    + instance.getTitle() + "」,无需处理";
            notifyWorkflow(t.getAssigneeId(), instance,
                    "workflow:" + instance.getId() + ":cancelled:" + t.getId(),
                    "workflow.cancelled", "cancelled", "审批已撤销", cancelledContent,
                    "该审批已撤销，无需继续处理", "查看记录", "/approval/center?tab=done", false);
        }

        recordHistory(instanceId, "撤销", getCurrentUserId(), "cancel", null);
    }

    @Override
    @Transactional
    public void removeStarted(Long instanceId) {
        WfInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException("流程实例不存在");
        }
        if (!Objects.equals(instance.getInitiatorId(), getCurrentUserId())) {
            throw new BusinessException("只有发起人可以删除自己的申请记录");
        }
        if (instance.getStatus() != null && (instance.getStatus() == 0 || instance.getStatus() == 4)) {
            throw new BusinessException("审批中/待修改的申请请先撤销后再删除");
        }
        taskMapper.delete(new LambdaQueryWrapper<WfTask>().eq(WfTask::getInstanceId, instanceId));
        historyMapper.delete(new LambdaQueryWrapper<WfHistory>().eq(WfHistory::getInstanceId, instanceId));
        attachmentMapper.delete(new LambdaQueryWrapper<WfAttachment>().eq(WfAttachment::getInstanceId, instanceId));
        instanceMapper.deleteById(instanceId);
    }

    @Override
    public WfInstanceVO getDetail(Long instanceId) {
        WfInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            return null;
        }

        WfInstanceVO vo = new WfInstanceVO();
        BeanUtils.copyProperties(instance, vo);
        // 发起人显示真实姓名(而非账号代号"用户10")
        vo.setInitiatorName(resolveUserName(instance.getInitiatorId()));

        // 流程名称 + 配置:读实例绑定的版本快照(在途单展示与流转口径一致),回退当前定义
        WfProcessDef def = processDefMapper.selectById(instance.getProcessDefId());
        if (def != null) {
            vo.setProcessName(def.getName());
        }
        try {
            vo.setProcessConfig(instanceConfigJson(instance, def));
        } catch (BusinessException e) {
            vo.setProcessConfig(null); // 老坏数据不至于让详情打不开
        }
        vo.setFormConfig(instanceFormConfigJson(instance, def));

        // 获取当前待办任务节点 + 当前处理人(用于"找谁催办") + 任务ID/时限(催办按钮用)
        LambdaQueryWrapper<WfTask> taskWrapper = new LambdaQueryWrapper<>();
        taskWrapper.eq(WfTask::getInstanceId, instanceId).eq(WfTask::getStatus, 0);
        List<WfTask> pendingTasks = taskMapper.selectList(taskWrapper);
        if (!pendingTasks.isEmpty()) {
            WfTask current = pendingTasks.get(0);
            vo.setCurrentNodeName(current.getNodeName());
            vo.setCurrentTaskId(current.getId());
            vo.setCurrentTaskDeadline(current.getDeadline());
            if (current.getAssigneeId() != null) {
                vo.setCurrentAssigneeName(resolveUserName(current.getAssigneeId()));
            }
            // 会签:当前节点全部待办处理人(同 node_id/名的多条待办),供前端显示"张三、李四审批中"
            List<String> curNames = new java.util.ArrayList<>();
            for (WfTask t : pendingTasks) {
                boolean sameNode = StringUtils.hasText(current.getNodeId())
                        ? current.getNodeId().equals(t.getNodeId())
                        : Objects.equals(current.getNodeName(), t.getNodeName());
                if (sameNode && t.getAssigneeId() != null) {
                    String nm = resolveUserName(t.getAssigneeId());
                    if (StringUtils.hasText(nm) && !curNames.contains(nm)) {
                        curNames.add(nm);
                    }
                }
            }
            vo.setCurrentAssigneeNames(curNames);
        }

        // 附件(真文件):前端用 fileId 走 file 模块带 token 预览/下载
        List<WfAttachment> atts = attachmentMapper.selectList(new LambdaQueryWrapper<WfAttachment>()
                .eq(WfAttachment::getInstanceId, instanceId).orderByAsc(WfAttachment::getId));
        if (!atts.isEmpty()) {
            vo.setAttachments(atts.stream().map(a -> {
                WfAttachmentVO av = new WfAttachmentVO();
                BeanUtils.copyProperties(a, av);
                return av;
            }).collect(Collectors.toList()));
        }

        // 抄送对象:本实例 nodeType=cc 的任务对应的处理人姓名
        List<WfTask> ccTasks = taskMapper.selectList(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getInstanceId, instanceId).eq(WfTask::getNodeType, "cc"));
        if (!ccTasks.isEmpty()) {
            java.util.List<String> ccNames = new java.util.ArrayList<>();
            for (WfTask ct : ccTasks) {
                String nm = resolveUserName(ct.getAssigneeId());
                if (StringUtils.hasText(nm) && !ccNames.contains(nm)) {
                    ccNames.add(nm);
                }
            }
            vo.setCcNames(ccNames);
        }

        // 获取审批历史 + 回填操作人真实姓名(WfHistory 只存 operator_id,VO 的 operatorName 之前恒 null)
        LambdaQueryWrapper<WfHistory> histWrapper = new LambdaQueryWrapper<>();
        histWrapper.eq(WfHistory::getInstanceId, instanceId).orderByAsc(WfHistory::getOperTime);
        List<WfHistory> histories = historyMapper.selectList(histWrapper);
        Map<Long, String> operNameMap = buildUserNameMap(histories.stream()
                .map(WfHistory::getOperatorId).filter(Objects::nonNull).distinct().collect(Collectors.toList()));
        vo.setHistories(histories.stream().map(h -> {
            WfHistoryVO hv = new WfHistoryVO();
            BeanUtils.copyProperties(h, hv);
            hv.setOperatorName(operNameMap.get(h.getOperatorId()));
            return hv;
        }).collect(Collectors.toList()));

        return vo;
    }

    @Override
    public IPage<WfTaskVO> getMyTodo(WfTaskQuery query) {
        Page<WfTaskVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return taskMapper.selectTodoPage(page, getCurrentUserId(), query);
    }

    @Override
    public IPage<WfTaskVO> getMyCc(WfTaskQuery query) {
        Page<WfTaskVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return taskMapper.selectCcPage(page, getCurrentUserId(), query);
    }

    @Override
    public IPage<WfTaskVO> getMyDone(WfTaskQuery query) {
        Page<WfTaskVO> page = new Page<>(query.getPageNum(), query.getPageSize());
        return taskMapper.selectDonePage(page, getCurrentUserId(), query);
    }

    @Override
    public IPage<WfInstanceVO> getMyStarted(WfTaskQuery query) {
        Page<WfInstance> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<WfInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WfInstance::getInitiatorId, getCurrentUserId());
        // 服务端筛选:关键字命中标题;流程按 processKey;时间段按发起时间
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(WfInstance::getTitle, query.getKeyword());
        }
        if (StringUtils.hasText(query.getProcessKey())) {
            List<Long> defIds = processDefMapper.selectList(new LambdaQueryWrapper<WfProcessDef>()
                            .eq(WfProcessDef::getProcessKey, query.getProcessKey()))
                    .stream().map(WfProcessDef::getId).collect(Collectors.toList());
            if (defIds.isEmpty()) {
                return new Page<>(query.getPageNum(), query.getPageSize());
            }
            wrapper.in(WfInstance::getProcessDefId, defIds);
        }
        if (StringUtils.hasText(query.getStartDate())) {
            wrapper.ge(WfInstance::getStartTime, query.getStartDate() + " 00:00:00");
        }
        if (StringUtils.hasText(query.getEndDate())) {
            wrapper.le(WfInstance::getStartTime, query.getEndDate() + " 23:59:59");
        }
        wrapper.orderByDesc(WfInstance::getStartTime);
        IPage<WfInstance> result = instanceMapper.selectPage(page, wrapper);

        Page<WfInstanceVO> voPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        // 批量查流程定义名,消除每条实例单独查的 N+1
        java.util.List<Long> defIds = result.getRecords().stream()
                .map(WfInstance::getProcessDefId).filter(java.util.Objects::nonNull).distinct()
                .collect(Collectors.toList());
        java.util.Map<Long, WfProcessDef> defMap = defIds.isEmpty() ? java.util.Collections.emptyMap()
                : processDefMapper.selectBatchIds(defIds).stream()
                        .collect(Collectors.toMap(WfProcessDef::getId, d -> d, (a, b) -> a));
        // 批量查发起人真实姓名,消除 N+1;避免前端显示"用户10"代号
        Map<Long, String> initiatorNameMap = buildUserNameMap(result.getRecords().stream()
                .map(WfInstance::getInitiatorId).filter(Objects::nonNull).distinct()
                .collect(Collectors.toList()));
        voPage.setRecords(result.getRecords().stream().map(inst -> {
            WfInstanceVO vo = new WfInstanceVO();
            BeanUtils.copyProperties(inst, vo);
            WfProcessDef def = defMap.get(inst.getProcessDefId());
            if (def != null) {
                vo.setProcessName(def.getName());
                vo.setFormConfig(def.getFormConfig());
                vo.setProcessConfig(def.getProcessConfig());
            }
            vo.setInitiatorName(initiatorNameMap.get(inst.getInitiatorId()));
            return vo;
        }).collect(Collectors.toList()));
        return voPage;
    }

    // ============= 流程引擎核心方法 =============

    private void processNode(WfInstance instance, Map<String, Object> node,
                             List<Map<String, Object>> nodes, List<Map<String, Object>> edges,
                             Map<String, Object> formData) {
        processNode(instance, node, nodes, edges, formData, new HashSet<>());
    }

    private void processNode(WfInstance instance, Map<String, Object> node,
                             List<Map<String, Object>> nodes, List<Map<String, Object>> edges,
                             Map<String, Object> formData, Set<String> visited) {
        if (node == null) {
            completeInstance(instance);
            return;
        }

        // 环路防护:同一次流转中节点不应被重复进入(条件节点往回跳会无限递归 → StackOverflow)
        String guardId = (String) node.get("id");
        if (guardId != null && !visited.add(guardId)) {
            throw new BusinessException("流程定义存在环路,无法继续: " + guardId);
        }

        String type = (String) node.get("type");
        switch (type) {
            case "approval":
                createTask(instance, node);
                break;
            case "condition":
                handleConditionNode(instance, node, nodes, edges, formData, visited);
                break;
            case "cc":
                // 抄送节点不再是装饰:流程走到即抄送该节点配置的人并通知,然后继续下一节点(不停等)
                createCcFromNode(instance, node);
                continueToNext(instance, node, nodes, edges, formData, visited);
                break;
            case "end":
                completeInstance(instance);
                break;
            default:
                continueToNext(instance, node, nodes, edges, formData, visited);
                break;
        }
    }

    /** 走到下一节点;无下一节点则结束 */
    private void continueToNext(WfInstance instance, Map<String, Object> node,
                                List<Map<String, Object>> nodes, List<Map<String, Object>> edges,
                                Map<String, Object> formData, Set<String> visited) {
        String nodeId = (String) node.get("id");
        String nextId = findNextNodeId(nodeId, edges);
        if (nextId != null) {
            processNode(instance, findNodeById(nextId, nodes), nodes, edges, formData, visited);
        } else {
            completeInstance(instance);
        }
    }

    /** cc 节点:按节点 assignees/cc 配置解析抄送人,写抄送记录(status=4,不进待办)并通知 */
    private void createCcFromNode(WfInstance instance, Map<String, Object> node) {
        List<Long> ccIds = resolveAssignees(node, instance.getInitiatorId());
        if (ccIds.isEmpty()) {
            log.warn("cc节点[{}]未解析到抄送人,跳过 instanceId={}", node.get("name"), instance.getId());
            return;
        }
        String nodeId = node.get("id") == null ? null : node.get("id").toString();
        for (Long uid : ccIds) {
            insertCcRecord(instance, uid, nodeId);
        }
    }

    /** 抄送一条记录(去重:同实例同人已抄过则跳过)并发通知 */
    private void insertCcRecord(WfInstance instance, Long userId, String nodeId) {
        if (userId == null) {
            return;
        }
        Long existing = taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getInstanceId, instance.getId())
                .eq(WfTask::getNodeType, "cc")
                .eq(WfTask::getAssigneeId, userId));
        if (existing != null && existing > 0) {
            return;
        }
        WfTask cc = new WfTask();
        cc.setInstanceId(instance.getId());
        cc.setNodeName("抄送");
        cc.setNodeId(nodeId);
        cc.setNodeType("cc");
        cc.setAssigneeId(userId);
        cc.setStatus(4); // 已抄送(不进待办)
        cc.setReadFlag(0); // 未读
        cc.setHandleTime(LocalDateTime.now());
        taskMapper.insert(cc);
        String ccContent = "抄送给你:" + safeName(instance.getInitiatorId()) + "的「"
                + instance.getTitle() + "」" + buildFormSummary(parseJsonQuietly(instance.getFormData()));
        notifyWorkflow(userId, instance,
                "workflow:" + instance.getId() + ":cc:" + cc.getId(),
                "workflow.cc", "cc", "抄送给你", ccContent,
                "请查阅本次审批内容和结果", "查看抄送", "/approval/center?tab=cc", false);
    }

    private void createTask(WfInstance instance, Map<String, Object> node) {
        // 多审批人(会签/或签):为每个审批人各建一个待办任务;单审批人则只建一个(向后兼容)
        List<Long> assigneeIds = resolveAssignees(node, instance.getInitiatorId());
        String nodeName = (String) node.get("name");
        if (assigneeIds.isEmpty()) {
            // 节点没有配置任何审批人:阻断,绝不落到发起人自审
            throw new BusinessException("流程节点[" + nodeName + "]没有配置审批人,请联系管理员在审批设置中补全流程");
        }
        String nodeType = (String) node.get("type");
        String nodeId = node.get("id") == null ? null : node.get("id").toString();
        LocalDateTime deadline = deadlineOf(node);
        for (Long uid : assigneeIds) {
            WfTask task = new WfTask();
            task.setInstanceId(instance.getId());
            task.setNodeName(nodeName);
            task.setNodeId(nodeId);
            task.setNodeType(nodeType);
            task.setStatus(0); // 待处理
            task.setAssigneeId(uid);
            task.setDeadline(deadline);
            taskMapper.insert(task);
            String todoContent = "待你审批:" + safeName(instance.getInitiatorId()) + "的「"
                    + instance.getTitle() + "」" + buildFormSummary(parseJsonQuietly(instance.getFormData()));
            notifyWorkflow(uid, instance,
                    "workflow:" + instance.getId() + ":todo:" + task.getId(),
                    "workflow.todo", "pending", "待你审批", todoContent,
                    "请按流程要求及时完成审批", "去审批", "/approval/center?tab=todo", true);
        }
    }

    /** 节点审批时限:设计器配置 timeoutHours(小时,>0 才生效)→ 到达节点时生成 deadline */
    private LocalDateTime deadlineOf(Map<String, Object> node) {
        Object hours = node.get("timeoutHours");
        if (hours == null) {
            return null;
        }
        try {
            double h = Double.parseDouble(hours.toString().trim());
            if (h > 0) {
                return LocalDateTime.now().plusMinutes((long) (h * 60));
            }
        } catch (Exception ignore) { /* 非数字视为未配置 */ }
        return null;
    }

    /** 本节点的兄弟任务(会签/或签同节点多任务):新数据按 node_id 匹配,老数据按节点名 */
    private List<WfTask> selectSiblingTasks(Long instanceId, WfTask task) {
        LambdaQueryWrapper<WfTask> w = new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getInstanceId, instanceId);
        if (StringUtils.hasText(task.getNodeId())) {
            w.eq(WfTask::getNodeId, task.getNodeId());
        } else {
            w.eq(WfTask::getNodeName, task.getNodeName());
        }
        return taskMapper.selectList(w);
    }

    /** 作废本节点其余待处理任务(status=5):或签他人已办/本节点被驳回等场景 */
    private void voidPendingSiblings(List<WfTask> siblings, Long excludeTaskId) {
        for (WfTask t : siblings) {
            if (t.getStatus() != null && t.getStatus() == 0 && !t.getId().equals(excludeTaskId)) {
                t.setStatus(5);
                t.setHandleTime(LocalDateTime.now());
                taskMapper.updateById(t);
            }
        }
    }

    // ============= 审批业务通知 =============

    /** 严格登记审批业务卡片；调用方均处于审批事务内，失败必须向上抛出并回滚业务。 */
    private void notifyWorkflow(Long userId, WfInstance instance, String eventId, String eventType,
                                String currentStatus, String title, String content, String requirement,
                                String actionLabel, String actionUrl, boolean important) {
        if (userId == null || instance == null || instance.getId() == null) {
            throw new BusinessException("审批通知缺少接收人或流程实例");
        }
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId(eventId)
                .eventType(eventType)
                .title(title)
                .text(content)
                .recipientIds(List.of(userId))
                .businessType("workflow")
                .businessId(instance.getId())
                .currentStatus(currentStatus)
                .responsibleId(userId)
                .requirement(requirement)
                .actionLabel(actionLabel)
                .actionUrl(actionUrl)
                .important(important)
                .build());
    }

    private String safeName(Long userId) {
        try {
            String name = resolveUserName(userId);
            return StringUtils.hasText(name) ? name : ("用户" + userId);
        } catch (Exception e) {
            return "用户" + userId;
        }
    }

    /** 通知摘要:有金额带金额(付款/借款/退款/备用金等),请假类带天数 */
    private String buildFormSummary(Map<String, Object> formData) {
        if (formData == null) {
            return "";
        }
        Object amount = formData.get("amount") != null ? formData.get("amount") : formData.get("totalAmount");
        if (amount != null) {
            try {
                double v = Double.parseDouble(amount.toString().trim());
                if (v > 0) {
                    return " ¥" + fmt(v);
                }
            } catch (Exception ignore) { /* 非数字金额不进摘要 */ }
        }
        Object days = formData.get("days");
        if (days != null && StringUtils.hasText(days.toString())) {
            return " " + days + "天";
        }
        return "";
    }

    /** 解析 formData,失败返回 null(通知摘要用,不因坏数据抛错) */
    private Map<String, Object> parseJsonQuietly(String json) {
        try {
            return parseJson(json);
        } catch (Exception e) {
            return null;
        }
    }

    /** 解析节点审批人列表:有 assignees(多审批人)用它,否则回退单 assigneeType/Value */
    @SuppressWarnings("unchecked")
    private List<Long> resolveAssignees(Map<String, Object> node, Long initiatorId) {
        List<Long> ids = new ArrayList<>();
        Object assignees = node.get("assignees");
        if (assignees instanceof List && !((List<?>) assignees).isEmpty()) {
            for (Object o : (List<?>) assignees) {
                if (o instanceof Map) {
                    Map<String, Object> a = (Map<String, Object>) o;
                    Object t = a.get("assigneeType");
                    Object v = a.get("assigneeValue");
                    Long uid = resolveAssignee(t == null ? null : t.toString(), v == null ? null : v.toString(), initiatorId);
                    if (uid != null && !ids.contains(uid)) {
                        ids.add(uid);
                    }
                }
            }
        } else {
            Long uid = resolveAssignee((String) node.get("assigneeType"), (String) node.get("assigneeValue"), initiatorId);
            if (uid != null) {
                ids.add(uid);
            }
        }
        return ids;
    }

    /**
     * 解析节点审批人。解析不到 = 抛异常阻断发起,并说明缺什么;
     * 绝不允许"解析不到就让发起人自审"或"静默落到 admin"的兜底。
     */
    private Long resolveAssignee(String assigneeType, String assigneeValue, Long initiatorId) {
        if ("user".equals(assigneeType)) {
            Long uid;
            try {
                uid = Long.parseLong(assigneeValue);
            } catch (Exception e) {
                throw new BusinessException("流程配置的指定审批人无效(" + assigneeValue + "),请联系管理员在审批设置中修正流程");
            }
            SysUser u = userMapper.selectById(uid);
            if (u == null || u.getStatus() == null || u.getStatus() != 0) {
                throw new BusinessException("流程指定的审批人账号不存在或已停用(ID=" + assigneeValue + "),请联系管理员修正流程");
            }
            if (uid.equals(initiatorId)) {
                throw new BusinessException("流程指定的审批人是发起人本人,不允许自己审批自己,请联系管理员调整流程");
            }
            return uid;
        }
        // 直属上级:取发起人的员工档案里设置的直属上级(manager_id 即上级用户ID)
        if ("supervisor".equals(assigneeType)) {
            OrgEmployee emp = findEmpByUser(initiatorId);
            if (emp == null) {
                throw new BusinessException("发起人没有员工档案,无法确定直属上级,请联系HR先在组织人事中建立员工档案");
            }
            if (emp.getManagerId() == null) {
                throw new BusinessException("请先在员工档案维护「" + emp.getName() + "」的直属上级,再发起本审批");
            }
            if (emp.getManagerId().equals(initiatorId)) {
                throw new BusinessException("员工档案里「" + emp.getName() + "」的直属上级是本人,不允许自己审批自己,请联系HR修正");
            }
            return emp.getManagerId();
        }
        if ("role".equals(assigneeType) || "dept_leader".equals(assigneeType)) {
            String roleKey = normalizeWorkflowRoleKey(assigneeValue);
            // 部门主管:按"发起人所在部门 -> sys_dept.leader_id"解析,主管是本人时沿部门链向上
            if ("dept_manager".equals(roleKey)) {
                return resolveDeptManager(initiatorId);
            }
            // 其他角色:取该角色下第一个不是发起人本人的可用账号
            List<Long> candidates = userMapper.selectUserIdsByRoleKey(roleKey);
            for (Long uid : candidates) {
                if (!uid.equals(initiatorId)) {
                    return uid;
                }
            }
            if (candidates.isEmpty()) {
                throw new BusinessException("角色「" + roleKey + "」下没有可用审批人,请在角色管理中为该角色分配员工");
            }
            throw new BusinessException("角色「" + roleKey + "」下只有发起人本人,不允许自己审批自己,请为该角色补充其他成员");
        }
        throw new BusinessException("流程节点审批人配置无法识别(type=" + assigneeType + "),请联系管理员检查流程设计");
    }

    /**
     * 部门主管解析:发起人 org_employee.dept_id -> sys_dept.leader_id;
     * 主管是发起人本人时沿部门链向上找(禁止自己审批自己),找不到即阻断。
     */
    private Long resolveDeptManager(Long initiatorId) {
        OrgEmployee emp = findEmpByUser(initiatorId);
        if (emp == null) {
            throw new BusinessException("发起人没有员工档案,无法按部门确定主管,请联系HR先在组织人事中建立员工档案");
        }
        if (emp.getDeptId() == null) {
            throw new BusinessException("员工「" + emp.getName() + "」未设置所属部门,请联系HR在员工档案维护部门后再发起审批");
        }
        Long deptId = emp.getDeptId();
        int hops = 0;
        while (deptId != null && deptId > 0 && hops++ < 20) {
            SysDept dept = deptMapper.selectById(deptId);
            if (dept == null) {
                break;
            }
            Long leaderId = dept.getLeaderId();
            if (leaderId != null && !leaderId.equals(initiatorId)) {
                SysUser u = userMapper.selectById(leaderId);
                if (u != null && u.getStatus() != null && u.getStatus() == 0) {
                    return leaderId;
                }
            }
            deptId = dept.getParentId();
        }
        throw new BusinessException("员工「" + emp.getName() + "」所在部门链上找不到可用的部门主管(未设置/是本人/账号停用),请在系统设置-部门管理维护部门主管");
    }

    private String normalizeWorkflowRoleKey(String roleKey) {
        if ("dept_leader".equals(roleKey)) {
            return "dept_manager";
        }
        return roleKey;
    }

    // ============= 发布预检:审批链解析校验 =============

    /**
     * 发布前预检:对流程里每个审批节点的审批人配置做解析校验。
     * supervisor/部门主管类按"每一个有账号的员工作为发起人"逐一模拟(公司顶层负责人豁免,他没有上级),
     * 任一节点解析不到人则返回问题清单;空列表 = 预检通过。
     */
    @Override
    @SuppressWarnings("unchecked")
    public List<String> precheckProcessDef(Long defId) {
        WfProcessDef def = processDefMapper.selectById(defId);
        if (def == null) {
            return Collections.singletonList("流程定义不存在(id=" + defId + ")");
        }
        Map<String, Object> config;
        try {
            config = parseJson(def.getProcessConfig());
        } catch (Exception e) {
            return Collections.singletonList("流程配置不是有效JSON,无法解析");
        }
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) config.get("nodes");
        if (nodes == null || nodes.isEmpty()) {
            return Collections.singletonList("流程配置缺少节点(nodes)");
        }
        List<String> problems = new ArrayList<>();
        Long rootLeaderId = findRootLeaderId();
        List<OrgEmployee> employees = orgEmployeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .isNotNull(OrgEmployee::getUserId));
        for (Map<String, Object> node : nodes) {
            if (!"approval".equals(node.get("type"))) {
                continue;
            }
            String nodeName = String.valueOf(node.get("name"));
            List<Map<String, Object>> specs = assigneeSpecsOf(node);
            if (specs.isEmpty()) {
                problems.add("节点[" + nodeName + "]没有配置审批人");
                continue;
            }
            for (Map<String, Object> spec : specs) {
                String type = spec.get("assigneeType") == null ? null : spec.get("assigneeType").toString();
                String value = spec.get("assigneeValue") == null ? null : spec.get("assigneeValue").toString();
                precheckSpec(nodeName, type, value, employees, rootLeaderId, problems);
            }
        }
        return problems;
    }

    /** 根部门(parent_id=0)的主管 = 公司顶层负责人 */
    private Long findRootLeaderId() {
        SysDept root = deptMapper.selectOne(new LambdaQueryWrapper<SysDept>()
                .eq(SysDept::getParentId, 0L).last("limit 1"));
        return root != null ? root.getLeaderId() : null;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> assigneeSpecsOf(Map<String, Object> node) {
        List<Map<String, Object>> specs = new ArrayList<>();
        Object assignees = node.get("assignees");
        if (assignees instanceof List && !((List<?>) assignees).isEmpty()) {
            for (Object o : (List<?>) assignees) {
                if (o instanceof Map) {
                    specs.add((Map<String, Object>) o);
                }
            }
        } else if (node.get("assigneeType") != null) {
            Map<String, Object> single = new HashMap<>();
            single.put("assigneeType", node.get("assigneeType"));
            single.put("assigneeValue", node.get("assigneeValue"));
            specs.add(single);
        }
        return specs;
    }

    private void precheckSpec(String nodeName, String type, String value,
                              List<OrgEmployee> employees, Long rootLeaderId, List<String> problems) {
        try {
            if ("supervisor".equals(type) || isDeptManagerSpec(type, value)) {
                List<String> failed = new ArrayList<>();
                for (OrgEmployee emp : employees) {
                    if (emp.getUserId() == null || emp.getUserId().equals(rootLeaderId)) {
                        continue; // 顶层负责人没有上级,豁免
                    }
                    try {
                        resolveAssignee(type, value, emp.getUserId());
                    } catch (Exception e) {
                        failed.add(StringUtils.hasText(emp.getName()) ? emp.getName() : ("员工" + emp.getId()));
                        if (failed.size() >= 5) {
                            break;
                        }
                    }
                }
                if (!failed.isEmpty()) {
                    problems.add("节点[" + nodeName + "]:员工 " + String.join("、", failed)
                            + (failed.size() >= 5 ? " 等" : "") + " 作为发起人时解析不到审批人,"
                            + ("supervisor".equals(type) ? "请先在员工档案维护直属上级" : "请先在部门管理维护部门主管"));
                }
                return;
            }
            if ("user".equals(type)) {
                resolveAssignee(type, value, null); // 只校验指定账号有效,与发起人无关
                return;
            }
            if ("role".equals(type) || "dept_leader".equals(type)) {
                String roleKey = normalizeWorkflowRoleKey(value);
                if (userMapper.selectUserIdsByRoleKey(roleKey).isEmpty()) {
                    problems.add("节点[" + nodeName + "]:角色「" + roleKey + "」下没有可用审批人,请在角色管理中分配成员");
                }
                return;
            }
            problems.add("节点[" + nodeName + "]:审批人类型无法识别(type=" + type + ")");
        } catch (BusinessException e) {
            problems.add("节点[" + nodeName + "]:" + e.getMessage());
        }
    }

    private boolean isDeptManagerSpec(String type, String value) {
        return ("role".equals(type) || "dept_leader".equals(type))
                && "dept_manager".equals(normalizeWorkflowRoleKey(value));
    }

    private void handleConditionNode(WfInstance instance, Map<String, Object> condNode,
                                     List<Map<String, Object>> nodes, List<Map<String, Object>> edges,
                                     Map<String, Object> formData, Set<String> visited) {
        List<Map<String, Object>> conditions = (List<Map<String, Object>>) condNode.get("conditions");
        if (conditions == null || conditions.isEmpty()) {
            // 没有条件，走默认路径(顺序下一个节点)
            String nodeId = (String) condNode.get("id");
            String nextId = findNextNodeId(nodeId, edges);
            Map<String, Object> nextNode = findNodeById(nextId, nodes);
            if (nextNode == null) {
                // 配置缺失:宁可报错回滚,也不能静默把审批"自动通过"
                throw new BusinessException("条件节点[" + condNode.get("name") + "]没有可路由的目标节点,流程配置有误");
            }
            processNode(instance, nextNode, nodes, edges, formData, visited);
            return;
        }

        for (Map<String, Object> cond : conditions) {
            String expression = (String) cond.get("expression");
            String nextNodeId = (String) cond.get("nextNode");
            if (evaluateCondition(expression, formData)) {
                Map<String, Object> nextNode = findNodeById(nextNodeId, nodes);
                if (nextNode == null) {
                    throw new BusinessException("条件节点[" + condNode.get("name") + "]命中的分支目标节点不存在: " + nextNodeId);
                }
                processNode(instance, nextNode, nodes, edges, formData, visited);
                return;
            }
        }

        // 所有条件都不满足:走"默认顺序边"=条件节点出边里、目标不属于任何条件分支的那条
        // (设计器构边时补的默认下一节点);老配置没有默认边时回退"最后一个条件的目标"(旧行为,防历史流程卡死)
        String condNodeId = (String) condNode.get("id");
        Set<String> condTargets = new HashSet<>();
        for (Map<String, Object> cond : conditions) {
            Object t = cond.get("nextNode");
            if (t != null) {
                condTargets.add(t.toString());
            }
        }
        String defaultNextId = null;
        for (Map<String, Object> edge : edges) {
            if (condNodeId != null && condNodeId.equals(edge.get("from"))
                    && edge.get("to") != null && !condTargets.contains(edge.get("to").toString())) {
                defaultNextId = edge.get("to").toString();
                break;
            }
        }
        if (defaultNextId == null) {
            defaultNextId = (String) conditions.get(conditions.size() - 1).get("nextNode");
        }
        Map<String, Object> nextNode = findNodeById(defaultNextId, nodes);
        if (nextNode == null) {
            throw new BusinessException("条件节点[" + condNode.get("name") + "]默认分支目标节点不存在: " + defaultNextId);
        }
        processNode(instance, nextNode, nodes, edges, formData, visited);
    }

    private boolean evaluateCondition(String expression, Map<String, Object> formData) {
        // 简易条件表达式解析器
        // 支持格式: "field > value"(数值), "field == value" / "field != value"(数值或文本,如 leaveType == 年假)
        try {
            String[] operators = {">=", "<=", "!=", ">", "<", "=="};
            for (String op : operators) {
                if (expression.contains(op)) {
                    String[] parts = expression.split(op.replace(">", "\\>").replace("<", "\\<"));
                    if (parts.length == 2) {
                        String field = parts[0].trim();
                        String valueStr = stripQuotes(parts[1].trim());
                        Object fieldValue = formData.get(field);
                        if (fieldValue == null) return false;
                        String leftStr = fieldValue.toString().trim();

                        Double leftNum = tryParseDouble(leftStr);
                        Double rightNum = tryParseDouble(valueStr);
                        if (leftNum != null && rightNum != null) {
                            switch (op) {
                                case ">": return leftNum > rightNum;
                                case "<": return leftNum < rightNum;
                                case ">=": return leftNum >= rightNum;
                                case "<=": return leftNum <= rightNum;
                                case "==": return leftNum.doubleValue() == rightNum.doubleValue();
                                case "!=": return leftNum.doubleValue() != rightNum.doubleValue();
                            }
                        }
                        // 文本条件:只支持等值/不等值(如 leaveType == 年假);大小比较对文本无意义
                        if ("==".equals(op)) {
                            return leftStr.equals(valueStr);
                        }
                        if ("!=".equals(op)) {
                            return !leftStr.equals(valueStr);
                        }
                        log.warn("文本字段不支持大小比较,条件视为不满足: {}", expression);
                        return false;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("条件表达式解析失败: {}", expression, e);
        }
        return false;
    }

    private Double tryParseDouble(String s) {
        try {
            return Double.parseDouble(s);
        } catch (Exception e) {
            return null;
        }
    }

    /** 去掉条件值两侧的引号(设计器里写 leaveType == "年假" 或 == '年假' 都认) */
    private String stripQuotes(String s) {
        if (s.length() >= 2 && ((s.startsWith("\"") && s.endsWith("\"")) || (s.startsWith("'") && s.endsWith("'")))) {
            return s.substring(1, s.length() - 1);
        }
        return s;
    }

    private void completeInstance(WfInstance instance) {
        instance.setStatus(1); // 已完成
        instance.setEndTime(LocalDateTime.now());
        instanceMapper.updateById(instance);
        // 业务联动:批准回写(请假记上/报销过审…);失败随事务回滚,绝不"审批通过了业务没生效"
        dispatchCallback(instance, "approved");
        createCarbonCopies(instance);
        String approvedContent = "你发起的「" + instance.getTitle() + "」已审批通过"
                + buildFormSummary(parseJsonQuietly(instance.getFormData()));
        notifyWorkflow(instance.getInitiatorId(), instance,
                "workflow:" + instance.getId() + ":approved",
                "workflow.approved", "approved", "审批已通过", approvedContent,
                "审批已经完成，请查看结果", "查看结果", "/approval/center?tab=started", false);
    }

    // ============= 业务联动回调分发 =============

    private ApprovalCallbackHandler findCallbackHandler(String bizType) {
        ApprovalCallbackHandler handler = callbackProvider.stream()
                .filter(h -> bizType.equals(h.bizType()))
                .findFirst().orElse(null);
        if (handler == null) {
            // 带 bizType 发起却没有处理器 = 接线错误,宁可报错也不静默丢联动
            throw new BusinessException("业务类型「" + bizType + "」没有对应的审批联动处理器,请联系管理员");
        }
        return handler;
    }

    /** 审批结论回调:approved/rejected/cancelled;无 bizType 直接跳过 */
    private void dispatchCallback(WfInstance instance, String event) {
        if (!StringUtils.hasText(instance.getBizType())) {
            return;
        }
        ApprovalCallbackHandler handler = findCallbackHandler(instance.getBizType());
        if ("approved".equals(event)) {
            handler.onApproved(instance);
        } else if ("rejected".equals(event)) {
            handler.onRejected(instance);
        } else if ("cancelled".equals(event)) {
            handler.onCancelled(instance);
        }
    }

    /** 审批通过后抄送:按流程配置的 cc 列表(发起人/指定成员/角色)生成抄送记录;未配置则默认抄送发起人 */
    private void createCarbonCopies(WfInstance instance) {
        try {
            WfProcessDef def = processDefMapper.selectById(instance.getProcessDefId());
            Map<String, Object> config = parseJson(instanceConfigJson(instance, def));
            Object ccObj = config == null ? null : config.get("cc");
            java.util.LinkedHashSet<Long> recipients = new java.util.LinkedHashSet<>();
            if (ccObj instanceof List) {
                for (Object o : (List<?>) ccObj) {
                    if (!(o instanceof Map)) {
                        continue;
                    }
                    Map<?, ?> cc = (Map<?, ?>) o;
                    String ctype = cc.get("type") == null ? "" : cc.get("type").toString();
                    String cval = cc.get("value") == null ? null : cc.get("value").toString();
                    if ("initiator".equals(ctype)) {
                        if (instance.getInitiatorId() != null) {
                            recipients.add(instance.getInitiatorId());
                        }
                    } else if (StringUtils.hasText(ctype)) {
                        // 抄送人解析失败只跳过该抄送对象,不影响其余抄送与审批主流程
                        try {
                            Long uid = resolveAssignee(ctype, cval, instance.getInitiatorId());
                            if (uid != null) {
                                recipients.add(uid);
                            }
                        } catch (Exception e) {
                            log.warn("抄送人解析失败,跳过 type={}, value={}, instanceId={}", ctype, cval, instance.getId());
                        }
                    }
                }
            }
            // 未配置任何抄送人时,默认抄送发起人(让申请人知道已通过)
            if (recipients.isEmpty() && instance.getInitiatorId() != null) {
                recipients.add(instance.getInitiatorId());
            }
            for (Long uid : recipients) {
                insertCcRecord(instance, uid, null);
            }
        } catch (Exception e) {
            log.warn("创建抄送失败 instanceId={}", instance.getId(), e);
        }
    }

    /**
     * 补充抄送:发起人/本实例任一节点处理人/管理员,可把实例抄送给同事。
     * 与 createCarbonCopies 同一套数据形态(WfTask nodeType=cc、status=4 不进待办),已抄送过的人自动去重。
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addCc(Long instanceId, List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            throw new BusinessException("请选择抄送人");
        }
        if (userIds.stream().anyMatch(Objects::isNull)) {
            throw new BusinessException("抄送人账号无效，请重新选择");
        }
        List<Long> targets = new ArrayList<>(new LinkedHashSet<>(userIds));
        if (targets.size() > MAX_MANUAL_CC_RECIPIENTS) {
            throw new BusinessException("单次最多抄送" + MAX_MANUAL_CC_RECIPIENTS + "人");
        }
        WfInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException("审批实例不存在");
        }
        Long uid = SecurityUtils.getCurrentUserId();
        boolean participant = taskMapper.selectCount(new LambdaQueryWrapper<WfTask>()
                .eq(WfTask::getInstanceId, instanceId)
                .eq(WfTask::getAssigneeId, uid)) > 0;
        boolean allowed = Objects.equals(instance.getInitiatorId(), uid)
                || participant
                || SecurityUtils.hasAnyRole("admin", "super_admin");
        if (!allowed) {
            throw new BusinessException("只有发起人或审批参与人可以抄送");
        }
        // 先校验整批再写入。selectById 受租户拦截，跨租户、停用或不存在账号统一拒绝，
        // 避免前半批已写任务/通知、后半批才失败。
        for (Long target : targets) {
            SysUser account = userMapper.selectById(target);
            if (account == null || account.getStatus() == null || account.getStatus() != 0) {
                throw new BusinessException("抄送人账号不存在或已停用，请重新选择");
            }
        }
        // insertCcRecord 内部已按(实例,人)去重并发通知(补抄以前无通知,现补上)
        for (Long target : targets) {
            insertCcRecord(instance, target, null);
        }
    }

    /**
     * 设计器选审批人即时预警:
     * - role/dept_leader(非部门主管角色):返回该角色可用人数,0 人则 warning;
     * - dept_manager(部门主管):返回未设部门主管的部门数;
     * - supervisor(直属上级):返回未设直属上级的在职有账号员工数(公司顶层负责人豁免)。
     */
    @Override
    public Map<String, Object> previewAssignee(String assigneeType, String assigneeValue) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        if ("supervisor".equals(assigneeType)) {
            Long rootLeader = findRootLeaderId();
            long gap = orgEmployeeMapper.selectCount(new LambdaQueryWrapper<OrgEmployee>()
                    .isNotNull(OrgEmployee::getUserId)
                    .isNull(OrgEmployee::getManagerId)
                    .ne(rootLeader != null, OrgEmployee::getUserId, rootLeader));
            res.put("count", gap);
            if (gap > 0) {
                res.put("ok", false);
                res.put("warning", "有 " + gap + " 名员工未设直属上级,他们发起时会被阻断,请先在员工档案维护");
            }
            return res;
        }
        String roleKey = normalizeWorkflowRoleKey(assigneeValue);
        if ("dept_manager".equals(roleKey)) {
            long noLeader = deptMapper.selectCount(new LambdaQueryWrapper<SysDept>()
                    .eq(SysDept::getStatus, 0).isNull(SysDept::getLeaderId));
            res.put("count", noLeader);
            if (noLeader > 0) {
                res.put("ok", false);
                res.put("warning", "有 " + noLeader + " 个部门未设部门主管,该部门员工发起时会被阻断");
            }
            return res;
        }
        // 其他角色:数可用成员
        int members = userMapper.selectUserIdsByRoleKey(roleKey).size();
        res.put("count", members);
        if (members == 0) {
            res.put("ok", false);
            res.put("warning", "角色「" + roleKey + "」下没有可用成员,发布会被阻断,请先在角色管理分配人员");
        }
        return res;
    }

    /** 标记一条抄送为已读(仅本人可标) */
    @Override
    public void markCcRead(Long taskId) {
        Long uid = getCurrentUserId();
        taskMapper.update(null, new LambdaUpdateWrapper<WfTask>()
                .eq(WfTask::getId, taskId)
                .eq(WfTask::getAssigneeId, uid)
                .eq(WfTask::getNodeType, "cc")
                .set(WfTask::getReadFlag, 1));
    }

    private Long recordHistory(Long instanceId, String nodeName, Long operatorId, String action, String comment) {
        WfHistory history = new WfHistory();
        history.setInstanceId(instanceId);
        history.setNodeName(nodeName);
        history.setOperatorId(operatorId);
        history.setAction(action);
        history.setComment(comment);
        history.setOperTime(LocalDateTime.now());
        historyMapper.insert(history);
        return history.getId();
    }

    // ============= 工具方法 =============

    private String findNextNodeId(String currentNodeId, List<Map<String, Object>> edges) {
        for (Map<String, Object> edge : edges) {
            if (currentNodeId.equals(edge.get("from"))) {
                return (String) edge.get("to");
            }
        }
        return null;
    }

    private Map<String, Object> findNodeById(String nodeId, List<Map<String, Object>> nodes) {
        if (nodeId == null) return null;
        for (Map<String, Object> node : nodes) {
            if (nodeId.equals(node.get("id"))) {
                return node;
            }
        }
        return null;
    }

    private String findNodeIdByName(String nodeName, List<Map<String, Object>> nodes) {
        for (Map<String, Object> node : nodes) {
            if (nodeName.equals(node.get("name"))) {
                return (String) node.get("id");
            }
        }
        return null;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        try {
            if (json == null || json.isEmpty()) return new HashMap<>();
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException("JSON解析失败", e);
        }
    }
}
