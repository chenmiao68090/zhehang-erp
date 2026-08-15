package com.zhehang.erp.modules.hrm.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeave;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 请假审批联动:审批中心的 leave 流程与考勤的 hrm_leave 打通(批完考勤才认账)。
 *
 * <p>发起时建 hrm_leave(status=0 待审),通过置1(考勤统计 HrmAttendanceServiceImpl 只读 status=1),
 * 驳回置2,撤销逻辑删除。与审批同事务,业务回写失败审批一起回滚。</p>
 *
 * <p>类型编码:wf 表单用中文(年假/病假/事假…),hrm_leave.leave_type 用数字
 * (与 attendance.vue 选项、HrmAttendanceServiceImpl 常量一致:1年假 2病假 3事假 4产假 5婚假 6其他)。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HrmLeaveApprovalHandler implements ApprovalCallbackHandler {

    public static final String BIZ_TYPE = "hrm_leave";

    private final HrmLeaveMapper leaveMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final ObjectMapper objectMapper;

    @Override
    public String bizType() {
        return BIZ_TYPE;
    }

    @Override
    public Long onStarted(WfInstance instance) {
        Map<String, Object> form = parseForm(instance);
        OrgEmployee emp = orgEmployeeMapper.selectOne(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getUserId, instance.getInitiatorId())
                .orderByDesc(OrgEmployee::getId).last("limit 1"));
        if (emp == null) {
            throw new BusinessException("发起人没有员工档案,请假无法计入考勤,请联系HR先建档");
        }
        HrmLeave leave = new HrmLeave();
        leave.setEmployeeId(emp.getId());
        leave.setLeaveType(mapLeaveType(str(form.get("leaveType"))));
        leave.setStartTime(halfDayToTime(str(form.get("startDate")), str(form.get("startAmpm")), true));
        leave.setEndTime(halfDayToTime(str(form.get("endDate")), str(form.get("endAmpm")), false));
        leave.setDuration(parseDays(form.get("days")));
        leave.setReason(str(form.get("reason")));
        leave.setStatus(0); // 待审批
        leaveMapper.insert(leave);
        return leave.getId();
    }

    @Override
    public void onResubmitted(WfInstance instance) {
        HrmLeave leave = requireLeave(instance);
        Map<String, Object> form = parseForm(instance);
        leave.setLeaveType(mapLeaveType(str(form.get("leaveType"))));
        leave.setStartTime(halfDayToTime(str(form.get("startDate")), str(form.get("startAmpm")), true));
        leave.setEndTime(halfDayToTime(str(form.get("endDate")), str(form.get("endAmpm")), false));
        leave.setDuration(parseDays(form.get("days")));
        leave.setReason(str(form.get("reason")));
        leave.setStatus(0);
        leaveMapper.updateById(leave);
    }

    @Override
    public void onApproved(WfInstance instance) {
        HrmLeave leave = requireLeave(instance);
        leave.setStatus(1); // 已通过:考勤统计从此认账
        leaveMapper.updateById(leave);
    }

    @Override
    public void onRejected(WfInstance instance) {
        HrmLeave leave = requireLeave(instance);
        leave.setStatus(2); // 已驳回
        leaveMapper.updateById(leave);
    }

    @Override
    public void onCancelled(WfInstance instance) {
        // 发起人主动撤回:请假记录逻辑删除,不留"驳回"的假象
        HrmLeave leave = leaveMapper.selectById(instance.getBizId());
        if (leave != null) {
            leaveMapper.deleteById(leave.getId());
        }
    }

    private HrmLeave requireLeave(WfInstance instance) {
        HrmLeave leave = instance.getBizId() == null ? null : leaveMapper.selectById(instance.getBizId());
        if (leave == null) {
            throw new BusinessException("审批关联的请假记录不存在(bizId=" + instance.getBizId() + "),请联系管理员");
        }
        return leave;
    }

    private Map<String, Object> parseForm(WfInstance instance) {
        try {
            return objectMapper.readValue(instance.getFormData(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new BusinessException("请假表单数据解析失败,无法联动考勤");
        }
    }

    /** wf 中文请假类型 → hrm_leave.leave_type 数字(考勤统计口径:2病假/3事假) */
    private Integer mapLeaveType(String zh) {
        if (zh == null) {
            return 6;
        }
        switch (zh) {
            case "年假": return 1;
            case "病假": return 2;
            case "事假": return 3;
            case "产假": return 4;
            case "婚假": return 5;
            default: return 6; // 调休/陪产假/育儿假/丧假/其他
        }
    }

    /**
     * 日期+半天 → 时刻:开始取(上午00:00/下午12:00),结束取(上午12:00/下午23:59)。
     * 兼容老格式"2026-07-02 上午"整串放在日期字段里。
     */
    private LocalDateTime halfDayToTime(String date, String ampm, boolean isStart) {
        if (!StringUtils.hasText(date)) {
            throw new BusinessException("请假起止日期不能为空");
        }
        String day = date.trim();
        String half = ampm;
        if (day.length() > 10) { // 老格式"2026-07-02 上午"
            String[] parts = day.split("\\s+");
            day = parts[0];
            if (parts.length > 1 && !StringUtils.hasText(half)) {
                half = parts[1];
            }
        }
        LocalDate d;
        try {
            d = LocalDate.parse(day.substring(0, 10));
        } catch (Exception e) {
            throw new BusinessException("请假日期格式无效: " + date);
        }
        boolean pm = "下午".equals(half);
        if (isStart) {
            return d.atTime(pm ? 12 : 0, 0);
        }
        return pm ? d.atTime(23, 59) : d.atTime(12, 0);
    }

    private BigDecimal parseDays(Object o) {
        try {
            return new BigDecimal(o.toString().trim());
        } catch (Exception e) {
            throw new BusinessException("请假天数无效");
        }
    }

    private String str(Object o) {
        return o == null ? null : o.toString();
    }
}
