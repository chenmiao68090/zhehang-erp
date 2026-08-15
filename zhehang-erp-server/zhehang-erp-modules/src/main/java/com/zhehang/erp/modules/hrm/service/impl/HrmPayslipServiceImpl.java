package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmPayslip;
import com.zhehang.erp.modules.hrm.mapper.HrmPayslipMapper;
import com.zhehang.erp.modules.hrm.service.IHrmPayslipService;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 薪酬核算·工资条 service 实现。
 * 数据范围:HR 端限 HR/管理员/老板;/my 只返回本人。工资条发放与 IM outbox 同事务登记。
 */
@Service
@RequiredArgsConstructor
public class HrmPayslipServiceImpl extends ServiceImpl<HrmPayslipMapper, HrmPayslip> implements IHrmPayslipService {

    private final HrmPayslipMapper payslipMapper;
    private final DataScopeHelper dataScopeHelper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final ImBusinessNotificationPublisher notificationPublisher;

    private static final int STATUS_PENDING = 0;    // 待发放
    private static final int STATUS_DISTRIBUTED = 1; // 已发放待确认
    private static final int STATUS_CONFIRMED = 2;   // 员工已确认
    private static final int STATUS_DISPUTED = 3;    // 员工有异议

    @Override
    public Map<String, Object> hrPage(int pageNum, int pageSize, String payMonth, Long employeeId,
                                      String deptName, Integer confirmStatus) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可查看工资条核算");
        }
        LambdaQueryWrapper<HrmPayslip> wrapper = baseFilter(payMonth, employeeId, deptName)
                .eq(confirmStatus != null, HrmPayslip::getConfirmStatus, confirmStatus)
                .orderByDesc(HrmPayslip::getPayMonth)
                .orderByAsc(HrmPayslip::getEmployeeName);
        IPage<HrmPayslip> page = payslipMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        // 总览计数(不含 confirmStatus 过滤,但沿用月份/员工/部门筛选口径,便于「当月总览」)
        Map<String, Object> counts = new HashMap<>();
        counts.put("all", countByStatus(payMonth, employeeId, deptName, null));
        counts.put("pending", countByStatus(payMonth, employeeId, deptName, STATUS_DISTRIBUTED));
        counts.put("confirmed", countByStatus(payMonth, employeeId, deptName, STATUS_CONFIRMED));
        counts.put("disputed", countByStatus(payMonth, employeeId, deptName, STATUS_DISPUTED));

        Map<String, Object> result = new HashMap<>();
        result.put("page", page);
        result.put("counts", counts);
        return result;
    }

    private long countByStatus(String payMonth, Long employeeId, String deptName, Integer confirmStatus) {
        LambdaQueryWrapper<HrmPayslip> w = baseFilter(payMonth, employeeId, deptName)
                .eq(confirmStatus != null, HrmPayslip::getConfirmStatus, confirmStatus);
        return payslipMapper.selectCount(w);
    }

    private LambdaQueryWrapper<HrmPayslip> baseFilter(String payMonth, Long employeeId, String deptName) {
        return new LambdaQueryWrapper<HrmPayslip>()
                .eq(StringUtils.hasText(payMonth), HrmPayslip::getPayMonth, payMonth)
                .eq(employeeId != null, HrmPayslip::getEmployeeId, employeeId)
                .like(StringUtils.hasText(deptName), HrmPayslip::getDeptName, deptName);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int batchSave(List<HrmPayslip> list) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可录入工资条");
        }
        if (list == null || list.isEmpty()) {
            return 0;
        }
        int n = 0;
        for (HrmPayslip p : list) {
            if (p == null) {
                continue;
            }
            // 批量导入一律作为新增(不认前端传来的 id/确认字段),状态归零为「待发放」
            p.setId(null);
            p.setConfirmStatus(STATUS_PENDING);
            p.setConfirmTime(null);
            p.setFeedback(null);
            payslipMapper.insert(p);
            n++;
        }
        return n;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int distribute(List<Long> ids, String payMonth) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可发放工资条");
        }
        LambdaQueryWrapper<HrmPayslip> qw = new LambdaQueryWrapper<HrmPayslip>()
                .eq(HrmPayslip::getConfirmStatus, STATUS_PENDING);
        boolean hasIds = ids != null && !ids.isEmpty();
        if (hasIds) {
            qw.in(HrmPayslip::getId, ids);
        } else if (StringUtils.hasText(payMonth)) {
            qw.eq(HrmPayslip::getPayMonth, payMonth);
        } else {
            throw new BusinessException("请指定发放的工资条或月份");
        }
        List<HrmPayslip> rows = payslipMapper.selectList(qw);
        for (HrmPayslip p : rows) {
            p.setConfirmStatus(STATUS_DISTRIBUTED);
            payslipMapper.updateById(p);
            notifyEmployee(p, "工资条已发放,请确认",
                    "您的 " + p.getPayMonth() + " 月工资条已发放,请进入【我的薪资】签字确认或提出异议。");
        }
        return rows.size();
    }

    @Override
    public List<HrmPayslip> myList(String payMonth) {
        Long myEmp = dataScopeHelper.currentEmployeeId();
        if (myEmp == null) {
            return new ArrayList<>();
        }
        // 员工只看已发放(及之后)的工资条,待发放(0)对员工不可见
        LambdaQueryWrapper<HrmPayslip> qw = new LambdaQueryWrapper<HrmPayslip>()
                .eq(HrmPayslip::getEmployeeId, myEmp)
                .ne(HrmPayslip::getConfirmStatus, STATUS_PENDING)
                .eq(StringUtils.hasText(payMonth), HrmPayslip::getPayMonth, payMonth)
                .orderByDesc(HrmPayslip::getPayMonth);
        return payslipMapper.selectList(qw);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirm(Long id) {
        HrmPayslip p = requireOwnDistributed(id);
        p.setConfirmStatus(STATUS_CONFIRMED);
        p.setConfirmTime(LocalDateTime.now());
        payslipMapper.updateById(p);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void feedback(Long id, String content) {
        if (!StringUtils.hasText(content)) {
            throw new BusinessException("请填写异议内容");
        }
        HrmPayslip p = requireOwnDistributed(id);
        p.setConfirmStatus(STATUS_DISPUTED);
        p.setConfirmTime(LocalDateTime.now());
        p.setFeedback(content.trim());
        payslipMapper.updateById(p);
    }

    /** 校验:工资条存在 + 归属当前员工 + 处于「已发放待确认」状态,否则抛异常。 */
    private HrmPayslip requireOwnDistributed(Long id) {
        HrmPayslip p = payslipMapper.selectById(id);
        if (p == null) {
            throw new BusinessException("工资条不存在");
        }
        Long myEmp = dataScopeHelper.currentEmployeeId();
        if (myEmp == null || !myEmp.equals(p.getEmployeeId())) {
            throw new BusinessException("只能操作自己的工资条");
        }
        if (p.getConfirmStatus() == null || p.getConfirmStatus() != STATUS_DISTRIBUTED) {
            throw new BusinessException("当前状态不可操作(需已发放待确认)");
        }
        return p;
    }

    /** 给员工登记一条工资条业务通知；拿不到员工 userId 时跳过，outbox 异常回滚本次发放。 */
    private void notifyEmployee(HrmPayslip p, String title, String content) {
        if (p.getEmployeeId() == null) {
            return;
        }
        OrgEmployee emp = orgEmployeeMapper.selectById(p.getEmployeeId());
        if (emp == null || emp.getUserId() == null) {
            return;
        }
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId("payslip:" + p.getId() + ":distributed")
                .eventType("hrm_payslip.distributed")
                .title(title)
                .text(content)
                .recipientIds(List.of(emp.getUserId()))
                .businessType("hrm_payslip")
                .businessId(p.getId())
                .currentStatus("distributed")
                .responsibleId(emp.getUserId())
                .requirement("请核对工资条并签字确认，如有疑问请提交异议")
                .actionLabel("去确认")
                .actionUrl("/culture/my-payslip")
                .important(true)
                .build());
    }
}
