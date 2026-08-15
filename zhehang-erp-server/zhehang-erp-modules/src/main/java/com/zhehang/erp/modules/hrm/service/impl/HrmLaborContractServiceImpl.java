package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLaborContract;
import com.zhehang.erp.modules.hrm.mapper.HrmLaborContractMapper;
import com.zhehang.erp.modules.hrm.service.IHrmLaborContractService;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 劳动合同管理 service 实现(飞书建议 161)。
 * 管理端(分页/新增/编辑/删除/提醒)限 HR/管理员/老板;/my 只返回本人合同。
 * 到期提醒尽力给员工本人发一条站内通知(拿不到 userId 就跳过),不新建定时任务,留手动/接口触发。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HrmLaborContractServiceImpl extends ServiceImpl<HrmLaborContractMapper, HrmLaborContract>
        implements IHrmLaborContractService {

    private final HrmLaborContractMapper contractMapper;
    private final DataScopeHelper dataScopeHelper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final ImBusinessNotificationPublisher notificationPublisher;
    private final GovernedFieldValueValidator governedFieldValueValidator;

    private static final int STATUS_ACTIVE = 1;      // 生效
    private static final int STATUS_EXPIRING = 2;     // 即将到期
    private static final int STATUS_EXPIRED = 3;      // 已到期
    private static final int STATUS_TERMINATED = 4;   // 已终止
    private static final int STATUS_RENEWED = 5;      // 已续签

    @Override
    public Map<String, Object> hrPage(int pageNum, int pageSize, Long employeeId, String contractType,
                                      Integer status, LocalDate endFrom, LocalDate endTo) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可查看劳动合同");
        }
        LambdaQueryWrapper<HrmLaborContract> wrapper = baseFilter(employeeId, contractType, endFrom, endTo)
                .eq(status != null, HrmLaborContract::getStatus, status)
                .orderByAsc(HrmLaborContract::getEndDate)
                .orderByDesc(HrmLaborContract::getCreateTime);
        IPage<HrmLaborContract> page = contractMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);

        // 总览计数(沿用员工/类型/到期区间筛选口径,不含 status 过滤)
        Map<String, Object> counts = new HashMap<>();
        counts.put("all", countByStatus(employeeId, contractType, endFrom, endTo, null));
        counts.put("active", countByStatus(employeeId, contractType, endFrom, endTo, STATUS_ACTIVE));
        counts.put("expiring", countByStatus(employeeId, contractType, endFrom, endTo, STATUS_EXPIRING));
        counts.put("expired", countByStatus(employeeId, contractType, endFrom, endTo, STATUS_EXPIRED));
        counts.put("terminated", countByStatus(employeeId, contractType, endFrom, endTo, STATUS_TERMINATED));

        Map<String, Object> result = new HashMap<>();
        result.put("page", page);
        result.put("counts", counts);
        return result;
    }

    private long countByStatus(Long employeeId, String contractType, LocalDate endFrom, LocalDate endTo,
                               Integer status) {
        LambdaQueryWrapper<HrmLaborContract> w = baseFilter(employeeId, contractType, endFrom, endTo)
                .eq(status != null, HrmLaborContract::getStatus, status);
        return contractMapper.selectCount(w);
    }

    private LambdaQueryWrapper<HrmLaborContract> baseFilter(Long employeeId, String contractType,
                                                            LocalDate endFrom, LocalDate endTo) {
        return new LambdaQueryWrapper<HrmLaborContract>()
                .eq(employeeId != null, HrmLaborContract::getEmployeeId, employeeId)
                .eq(StringUtils.hasText(contractType), HrmLaborContract::getContractType, contractType)
                .ge(endFrom != null, HrmLaborContract::getEndDate, endFrom)
                .le(endTo != null, HrmLaborContract::getEndDate, endTo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveOrUpdateContract(HrmLaborContract contract) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可维护劳动合同");
        }
        if (contract == null) {
            throw new BusinessException("劳动合同不能为空");
        }
        if (contract.getId() == null) {
            contract.setContractType(governedFieldValueValidator.validateNewValue(
                    GovernedFieldValueValidator.HR_LABOR_CONTRACT_TYPE,
                    "劳动合同类型", contract.getContractType(), false));
        } else {
            HrmLaborContract existing = contractMapper.selectById(contract.getId());
            if (existing == null) {
                throw new BusinessException("劳动合同不存在");
            }
            contract.setContractType(governedFieldValueValidator.validateChangedValue(
                    GovernedFieldValueValidator.HR_LABOR_CONTRACT_TYPE,
                    "劳动合同类型", existing.getContractType(), contract.getContractType(), false));
        }
        if (contract.getStatus() == null) {
            contract.setStatus(STATUS_ACTIVE);
        }
        if (contract.getId() == null) {
            contractMapper.insert(contract);
        } else {
            contractMapper.updateById(contract);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteContract(Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可删除劳动合同");
        }
        contractMapper.deleteById(id);
    }

    @Override
    public List<HrmLaborContract> expiring(int days) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可查看到期合同");
        }
        return contractMapper.selectList(expiringWrapper(days));
    }

    @Override
    public int remindExpiring(int days) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可发送到期提醒");
        }
        List<HrmLaborContract> rows = contractMapper.selectList(expiringWrapper(days));
        int reminded = 0;
        for (HrmLaborContract c : rows) {
            // 本方法只登记提醒、不改合同。没有外层事务时 Writer 会为每份合同单独开启事务，
            // 某一份提醒失败只记录该合同并继续，不回滚已成功登记的其他提醒。
            try {
                if (notifyEmployee(c)) {
                    reminded++;
                }
            } catch (RuntimeException error) {
                log.warn("劳动合同到期提醒登记失败, contractId={}, errorType={}",
                        c.getId(), error.getClass().getSimpleName());
            }
        }
        return reminded;
    }

    /** 即将到期口径:end_date 非空、落在 [今天, 今天+days] 区间,且状态非「已终止」。 */
    private LambdaQueryWrapper<HrmLaborContract> expiringWrapper(int days) {
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(days);
        return new LambdaQueryWrapper<HrmLaborContract>()
                .isNotNull(HrmLaborContract::getEndDate)
                .ge(HrmLaborContract::getEndDate, today)
                .le(HrmLaborContract::getEndDate, deadline)
                .ne(HrmLaborContract::getStatus, STATUS_TERMINATED)
                .orderByAsc(HrmLaborContract::getEndDate);
    }

    @Override
    public List<HrmLaborContract> myList() {
        Long myEmp = dataScopeHelper.currentEmployeeId();
        if (myEmp == null) {
            return new ArrayList<>();
        }
        LambdaQueryWrapper<HrmLaborContract> qw = new LambdaQueryWrapper<HrmLaborContract>()
                .eq(HrmLaborContract::getEmployeeId, myEmp)
                .orderByDesc(HrmLaborContract::getStartDate);
        return contractMapper.selectList(qw);
    }

    /** 给合同员工本人登记一条到期提醒；拿不到 userId 时跳过，outbox 异常交给批次逐条隔离。 */
    private boolean notifyEmployee(HrmLaborContract c) {
        if (c.getEmployeeId() == null || c.getId() == null || c.getEndDate() == null) {
            return false;
        }
        OrgEmployee emp = orgEmployeeMapper.selectById(c.getEmployeeId());
        if (emp == null || emp.getUserId() == null) {
            return false;
        }
        String endText = c.getEndDate().toString();
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId("labor-contract:" + c.getId() + ":expiring:" + endText)
                .eventType("hrm_labor_contract.expiring")
                .title("劳动合同即将到期提醒")
                .text("您的劳动合同将于 " + endText + " 到期")
                .recipientIds(List.of(emp.getUserId()))
                .businessType("hrm_labor_contract")
                .businessId(c.getId())
                .currentStatus("expiring")
                .responsibleId(emp.getUserId())
                .requirement("请及时与人事联系办理续签或相关手续")
                .actionLabel("查看我的合同")
                .actionUrl("/culture/self-service")
                .important(true)
                .build());
        return true;
    }
}
