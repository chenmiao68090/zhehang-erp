package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import com.zhehang.erp.modules.file.service.IFileInfoService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import com.zhehang.erp.modules.hrm.domain.vo.OffboardingSummaryVO;
import com.zhehang.erp.modules.hrm.domain.vo.OffboardingTimelineVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffDetailVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffVO;
import com.zhehang.erp.modules.hrm.mapper.HrmResignHandoverMapper;
import com.zhehang.erp.modules.hrm.service.IHrmResignHandoverService;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * 离职交接台账 service 实现(飞书建议 160)。
 * 管理端(list/save/getByEmployee)限 HR/管理员/老板;不改 org_employee,员工数据走既有只读接口。
 */
@Service
@RequiredArgsConstructor
public class HrmResignHandoverServiceImpl
        extends ServiceImpl<HrmResignHandoverMapper, HrmResignHandover>
        implements IHrmResignHandoverService {

    private static final int EMPLOYEE_STATUS_RESIGNED = 3;
    private static final int HANDOVER_PENDING = 0;
    private static final int HANDOVER_PROCESSING = 1;
    private static final int HANDOVER_CLOSED = 2;
    private static final int CHECK_MIN = 0;
    private static final int CHECK_MAX = 3;
    private static final String OFFBOARDING_SOP_SCOPE = "OFFBOARDING_SOP";

    private final HrmResignHandoverMapper handoverMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final SysUserMapper userMapper;
    private final DataScopeHelper dataScopeHelper;
    private final IFileInfoService fileInfoService;

    @Override
    public List<HrmResignHandover> listRecords(Long employeeId, Integer status) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可查看离职交接");
        }
        return handoverMapper.selectList(new LambdaQueryWrapper<HrmResignHandover>()
                .eq(HrmResignHandover::getDeleted, 0)
                .eq(employeeId != null, HrmResignHandover::getEmployeeId, employeeId)
                .eq(status != null, HrmResignHandover::getStatus, status)
                .orderByDesc(HrmResignHandover::getCreateTime));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveOrUpdateRecord(HrmResignHandover record) {
        requireManager("登记离职交接");
        if (record == null) {
            throw new BusinessException("请先选择离职员工");
        }

        HrmResignHandover existing = null;
        if (record.getId() != null) {
            existing = handoverMapper.selectById(record.getId());
            if (existing == null || Integer.valueOf(1).equals(existing.getDeleted())) {
                throw new BusinessException("交接记录不存在");
            }
            if (record.getRecordVersion() == null
                    || !Objects.equals(record.getRecordVersion(), existing.getRecordVersion())) {
                throw new BusinessException("交接记录已被他人更新，请刷新详情后重试");
            }
        }

        Long employeeId = record.getEmployeeId() != null
                ? record.getEmployeeId()
                : existing == null ? null : existing.getEmployeeId();
        if (employeeId == null) {
            throw new BusinessException("请先选择离职员工");
        }
        if (existing != null && !Objects.equals(existing.getEmployeeId(), employeeId)) {
            throw new BusinessException("禁止更换交接记录所属员工");
        }

        OrgEmployee employee = requireResignedEmployee(employeeId);
        int nextStatus = valueOr(record.getStatus(), existing == null ? null : existing.getStatus(), HANDOVER_PENDING);
        validateHandoverStatus(nextStatus);

        int customerStatus = checkedStatus(record.getCustomerCheckStatus(), existing == null ? null : existing.getCustomerCheckStatus());
        int taskStatus = checkedStatus(record.getTaskCheckStatus(), existing == null ? null : existing.getTaskCheckStatus());
        int documentStatus = checkedStatus(record.getDocumentCheckStatus(), existing == null ? null : existing.getDocumentCheckStatus());
        int assetStatus = checkedStatus(record.getAssetCheckStatus(), existing == null ? null : existing.getAssetCheckStatus());
        int settlementStatus = checkedStatus(record.getSettlementCheckStatus(), existing == null ? null : existing.getSettlementCheckStatus());

        Long receiverId = record.getHandoverToEmployeeId() != null
                ? record.getHandoverToEmployeeId()
                : existing == null ? null : existing.getHandoverToEmployeeId();
        OrgEmployee receiver = receiverId == null ? null : requireActiveReceiver(receiverId, employeeId);
        if (receiver == null && StringUtils.hasText(record.getHandoverTo())) {
            throw new BusinessException("交接接收人必须通过员工ID选择，不能直接填写姓名");
        }
        if (nextStatus >= HANDOVER_PROCESSING && receiver == null) {
            throw new BusinessException("交接中或闭环前必须选择在职接收人");
        }

        if (existing != null && Integer.valueOf(HANDOVER_CLOSED).equals(existing.getStatus())
                && nextStatus != HANDOVER_CLOSED) {
            throw new BusinessException("已闭环记录不能退回，如需更正请由管理员记录审计说明");
        }

        if (nextStatus == HANDOVER_CLOSED) {
            requireAllChecksCompleted(customerStatus, taskStatus, documentStatus, assetStatus, settlementStatus);
            requireAccountDisabled(employee);
        }

        HrmResignHandover safe = new HrmResignHandover();
        safe.setId(existing == null ? null : existing.getId());
        // 使用客户端实际读取到的版本作为 UPDATE 条件；不能改用刚重查到的最新版本。
        safe.setRecordVersion(existing == null ? null : record.getRecordVersion());
        safe.setEmployeeId(employee.getId());
        // 禁止前端伪造姓名；两个名称都由稳定员工ID派生。
        safe.setEmployeeName(employee.getName());
        safe.setHandoverDate(valueOr(record.getHandoverDate(), existing == null ? null : existing.getHandoverDate(), null));
        safe.setHandoverToEmployeeId(receiver == null ? null : receiver.getId());
        safe.setHandoverTo(receiver == null ? null : receiver.getName());
        safe.setSopFileId(Boolean.TRUE.equals(record.getClearSopFile())
                ? null
                : valueOr(record.getSopFileId(), existing == null ? null : existing.getSopFileId(), null));
        protectSopFile(safe.getSopFileId());
        safe.setItems(textValue(record.getItems(), existing == null ? null : existing.getItems(), 2000, "交接事项"));
        safe.setCustomerCheckStatus(customerStatus);
        safe.setTaskCheckStatus(taskStatus);
        safe.setDocumentCheckStatus(documentStatus);
        safe.setAssetCheckStatus(assetStatus);
        safe.setSettlementCheckStatus(settlementStatus);
        safe.setStatus(nextStatus);
        safe.setArchiveTime(nextStatus == HANDOVER_CLOSED
                ? existing != null && existing.getArchiveTime() != null
                    ? existing.getArchiveTime() : LocalDateTime.now()
                : null);
        safe.setRemark(textValue(record.getRemark(), existing == null ? null : existing.getRemark(), 500, "备注"));

        if (safe.getId() == null) {
            if (handoverMapper.insert(safe) <= 0) {
                throw new BusinessException("离职交接保存失败");
            }
        } else if (handoverMapper.updateById(safe) <= 0) {
            throw new BusinessException("交接记录不存在或已变更");
        }
    }

    @Override
    public List<HrmResignHandover> getByEmployee(Long employeeId) {
        requireManager("查看离职交接");
        if (employeeId == null) {
            throw new BusinessException("员工ID不能为空");
        }
        requireResignedEmployee(employeeId);
        return handoverMapper.selectList(new LambdaQueryWrapper<HrmResignHandover>()
                .eq(HrmResignHandover::getDeleted, 0)
                .eq(HrmResignHandover::getEmployeeId, employeeId)
                .orderByDesc(HrmResignHandover::getCreateTime)
                .orderByDesc(HrmResignHandover::getId));
    }

    @Override
    public IPage<ResignedStaffVO> selectCenterPage(int pageNum, int pageSize, String name,
                                                   Long deptId, Integer status, Boolean riskOnly) {
        requireManager("查看离职人员中心");
        if (status != null) {
            validateHandoverStatus(status);
        }
        int safePage = Math.max(1, pageNum);
        int safeSize = Math.max(1, Math.min(pageSize, 100));
        String safeName = StringUtils.hasText(name) ? name.trim() : null;
        return handoverMapper.selectCenterPage(new Page<>(safePage, safeSize), safeName,
                deptId, status, Boolean.TRUE.equals(riskOnly));
    }

    @Override
    public OffboardingSummaryVO getCenterSummary() {
        requireManager("查看离职人员汇总");
        OffboardingSummaryVO result = handoverMapper.selectCenterSummary();
        return result == null ? new OffboardingSummaryVO() : result;
    }

    @Override
    public ResignedStaffDetailVO getCenterDetail(Long employeeId) {
        requireManager("查看离职人员详情");
        if (employeeId == null) {
            throw new BusinessException("员工ID不能为空");
        }
        ResignedStaffVO employee = handoverMapper.selectCenterByEmployeeId(employeeId);
        if (employee == null) {
            throw new BusinessException("离职员工不存在");
        }
        List<HrmResignHandover> handovers = handoverMapper.selectList(
                new LambdaQueryWrapper<HrmResignHandover>()
                        .eq(HrmResignHandover::getDeleted, 0)
                        .eq(HrmResignHandover::getEmployeeId, employeeId)
                        .orderByDesc(HrmResignHandover::getCreateTime)
                        .orderByDesc(HrmResignHandover::getId));

        ResignedStaffDetailVO detail = new ResignedStaffDetailVO();
        detail.setEmployee(employee);
        detail.setHandovers(handovers);
        detail.setTimeline(buildTimeline(employee, handovers));
        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FileInfo uploadProtectedSop(MultipartFile file) {
        requireManager("上传离职交接附件");
        FileInfo stored = fileInfoService.uploadFile(file, null);
        if (stored == null || stored.getId() == null) {
            throw new BusinessException("离职交接附件上传失败");
        }
        markOffboardingScope(stored);
        return stored;
    }

    private List<OffboardingTimelineVO> buildTimeline(ResignedStaffVO employee,
                                                       List<HrmResignHandover> handovers) {
        List<OffboardingTimelineVO> timeline = new ArrayList<>();
        if (employee.getResignDate() != null) {
            timeline.add(new OffboardingTimelineVO("RESIGNED", "离职生效",
                    "员工状态已转为离职", employee.getResignDate().atStartOfDay()));
        }
        for (HrmResignHandover handover : handovers) {
            if (handover.getCreateTime() != null) {
                timeline.add(new OffboardingTimelineVO("HANDOVER_CREATED", "登记离职交接",
                        timelineDescription(handover), handover.getCreateTime()));
            }
            if (handover.getUpdateTime() != null
                    && !Objects.equals(handover.getUpdateTime(), handover.getCreateTime())
                    && !Objects.equals(handover.getUpdateTime(), handover.getArchiveTime())) {
                timeline.add(new OffboardingTimelineVO("HANDOVER_UPDATED", "更新交接进度",
                        timelineDescription(handover), handover.getUpdateTime()));
            }
            if (handover.getArchiveTime() != null) {
                timeline.add(new OffboardingTimelineVO("ARCHIVED", "离职交接已闭环",
                        "账号已停用或未开通，五项交接均已完成", handover.getArchiveTime()));
            }
        }
        timeline.sort(Comparator.comparing(OffboardingTimelineVO::getTime));
        return timeline;
    }

    private String timelineDescription(HrmResignHandover handover) {
        String statusText = switch (valueOr(handover.getStatus(), null, HANDOVER_PENDING)) {
            case HANDOVER_PROCESSING -> "交接中";
            case HANDOVER_CLOSED -> "已闭环";
            default -> "待交接";
        };
        return StringUtils.hasText(handover.getHandoverTo())
                ? "状态：" + statusText + "；接收人：" + handover.getHandoverTo()
                : "状态：" + statusText;
    }

    private OrgEmployee requireResignedEmployee(Long employeeId) {
        OrgEmployee employee = employeeMapper.selectById(employeeId);
        if (employee == null || !Integer.valueOf(EMPLOYEE_STATUS_RESIGNED).equals(employee.getStatus())) {
            throw new BusinessException("目标员工不存在或尚未离职");
        }
        requireSameTenant(employee.getTenantId());
        return employee;
    }

    private OrgEmployee requireActiveReceiver(Long receiverId, Long resignedEmployeeId) {
        if (Objects.equals(receiverId, resignedEmployeeId)) {
            throw new BusinessException("离职员工不能作为自己的交接接收人");
        }
        OrgEmployee receiver = employeeMapper.selectById(receiverId);
        if (receiver == null || receiver.getStatus() == null
                || (receiver.getStatus() != 1 && receiver.getStatus() != 2)) {
            throw new BusinessException("交接接收人必须是当前公司的在职或试用员工");
        }
        requireSameTenant(receiver.getTenantId());
        return receiver;
    }

    private void requireSameTenant(Long tenantId) {
        Long currentTenantId = SecurityUtils.getCurrentTenantId();
        if (currentTenantId == null || !currentTenantId.equals(tenantId)) {
            throw new BusinessException("员工不属于当前公司");
        }
    }

    private void requireAccountDisabled(OrgEmployee employee) {
        if (employee.getUserId() == null) {
            return; // 从未开通账号，不存在登录风险。
        }
        SysUser user = userMapper.selectById(employee.getUserId());
        if (user == null) {
            throw new BusinessException("员工账号关联异常，请先由管理员处理后再归档");
        }
        if (Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException("离职员工账号仍可登录，必须先停用账号再归档");
        }
    }

    private void protectSopFile(Long fileId) {
        if (fileId == null) {
            return;
        }
        FileInfo file = fileInfoService.getById(fileId);
        if (file == null) {
            throw new BusinessException("交接SOP附件不存在或不属于当前公司");
        }
        markOffboardingScope(file);
    }

    private void markOffboardingScope(FileInfo file) {
        if (OFFBOARDING_SOP_SCOPE.equalsIgnoreCase(file.getAccessScope())) {
            return;
        }
        file.setAccessScope(OFFBOARDING_SOP_SCOPE);
        if (!fileInfoService.updateById(file)) {
            throw new BusinessException("离职交接附件保护失败");
        }
    }

    private void requireAllChecksCompleted(int... statuses) {
        for (int status : statuses) {
            if (status != 2) {
                throw new BusinessException("客户、任务、资料、资产和结算全部完成后才能归档");
            }
        }
    }

    private int checkedStatus(Integer requested, Integer existing) {
        int value = valueOr(requested, existing, CHECK_MIN);
        if (value < CHECK_MIN || value > CHECK_MAX) {
            throw new BusinessException("交接确认状态不合法");
        }
        return value;
    }

    private void validateHandoverStatus(int status) {
        if (status < HANDOVER_PENDING || status > HANDOVER_CLOSED) {
            throw new BusinessException("离职交接状态不合法");
        }
    }

    private void requireManager(String action) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可" + action);
        }
    }

    private String textValue(String requested, String existing, int maxLength, String label) {
        String value = requested != null ? requested : existing;
        if (value != null && value.length() > maxLength) {
            throw new BusinessException(label + "不能超过" + maxLength + "个字符");
        }
        return value;
    }

    private <T> T valueOr(T requested, T existing, T defaultValue) {
        return requested != null ? requested : existing != null ? existing : defaultValue;
    }
}
