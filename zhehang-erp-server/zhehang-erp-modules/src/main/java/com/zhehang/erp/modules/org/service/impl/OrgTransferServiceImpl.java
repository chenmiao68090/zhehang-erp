package com.zhehang.erp.modules.org.service.impl;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.org.domain.dto.TransferDTO;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.entity.OrgTransfer;
import com.zhehang.erp.modules.org.domain.vo.TransferVO;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.mapper.OrgTransferMapper;
import com.zhehang.erp.modules.org.service.IOrgTransferService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrgTransferServiceImpl extends ServiceImpl<OrgTransferMapper, OrgTransfer> implements IOrgTransferService {

    private final OrgTransferMapper transferMapper;
    private final OrgEmployeeMapper employeeMapper;
    private final DataScopeHelper dataScopeHelper;
    private final IWfInstanceService wfInstanceService;
    private final ISysUserService sysUserService;

    /** 异动类型文案(与前端选项一致):建审批标题用 */
    private static final Map<Integer, String> TRANSFER_TYPE_LABELS = Map.of(
            2, "转正", 3, "调岗", 4, "晋升", 5, "离职");

    @Override
    public IPage<TransferVO> selectTransferPage(int pageNum, int pageSize, Long employeeId, Integer transferType, Integer status) {
        // 数据权限:非HR/管理员只能看自己的人事异动记录
        if (!dataScopeHelper.isHrOrAdmin()) {
            Long myEmp = dataScopeHelper.currentEmployeeId();
            employeeId = (myEmp != null ? myEmp : -1L);
        }
        Page<?> page = new Page<>(pageNum, pageSize);
        return transferMapper.selectTransferPage(page, employeeId, transferType, status);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createTransfer(TransferDTO dto) {
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            throw new BusinessException("无权限,仅HR/管理员/老板可发起人事异动");
        }
        if (dto == null || dto.getEmployeeId() == null || dto.getTransferType() == null
                || !TRANSFER_TYPE_LABELS.containsKey(dto.getTransferType())) {
            throw new BusinessException("人事异动类型不合法");
        }
        OrgEmployee employee = employeeMapper.selectById(dto.getEmployeeId());
        if (employee == null) {
            throw new BusinessException("员工不存在");
        }
        validateTransferAgainstCurrentEmployee(dto.getTransferType(), dto.getEffectiveDate(), employee);
        OrgTransfer transfer = new OrgTransfer();
        BeanUtils.copyProperties(dto, transfer);
        transfer.setStatus(0); // 待审批
        // 自动填充原部门/岗位
        if (transfer.getFromDeptId() == null) {
            transfer.setFromDeptId(employee.getDeptId());
        }
        if (transfer.getFromPostId() == null) {
            transfer.setFromPostId(employee.getPostId());
        }
        if (transferMapper.insert(transfer) <= 0) {
            throw new BusinessException("人事异动发起失败");
        }

        // 收编进审批中心:建单即发起 wf transfer 流程,批完由回调执行部门/岗位变更;
        // 发起失败(如审批链解析不到人)整体回滚,不留没人审的孤儿异动单。
        // 发起人 = 被调岗员工本人(而非操作的HR),审批链的"部门主管"才按该员工的部门解析
        if (employee.getUserId() == null) {
            throw new BusinessException("该员工未开通账号,无法发起异动审批,请先在员工与账号中开通");
        }
        String typeLabel = TRANSFER_TYPE_LABELS.getOrDefault(transfer.getTransferType(), "人事异动");
        Map<String, Object> formData = new HashMap<>();
        if (transfer.getEffectiveDate() != null) {
            formData.put("effectiveDate", transfer.getEffectiveDate().toString());
        }
        if (transfer.getReason() != null) {
            formData.put("reason", transfer.getReason());
        }
        wfInstanceService.startProcessAs("transfer",
                typeLabel + "申请-" + employee.getName(),
                formData, "org_transfer", transfer.getId(), employee.getUserId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveTransfer(Long id, Integer status, Long approverId) {
        OrgTransfer transfer = transferMapper.selectById(id);
        if (transfer == null) {
            throw new BusinessException("异动记录不存在");
        }
        if (transfer.getStatus() != 0) {
            throw new BusinessException("该异动记录已审批");
        }
        if (transfer.getTransferType() == null || !TRANSFER_TYPE_LABELS.containsKey(transfer.getTransferType())) {
            throw new BusinessException("人事异动类型不合法");
        }
        OrgTransfer approvalPatch = new OrgTransfer();
        approvalPatch.setStatus(status);
        approvalPatch.setApproverId(approverId);
        if (transferMapper.update(approvalPatch, new LambdaUpdateWrapper<OrgTransfer>()
                .eq(OrgTransfer::getId, id)
                .eq(OrgTransfer::getStatus, 0)) <= 0) {
            throw new BusinessException("该异动记录已审批或状态已变化，请刷新后重试");
        }
        transfer.setStatus(status);
        transfer.setApproverId(approverId);

        // 审批通过，更新员工信息
        if (status == 1) {
            OrgEmployee employee = employeeMapper.selectById(transfer.getEmployeeId());
            if (employee == null) {
                throw new BusinessException("员工不存在");
            }
            OrgEmployee patch = new OrgEmployee();
            LambdaUpdateWrapper<OrgEmployee> stateGuard = new LambdaUpdateWrapper<OrgEmployee>()
                    .eq(OrgEmployee::getId, employee.getId());
            switch (transfer.getTransferType()) {
                case 2: // 转正
                    if (!Integer.valueOf(2).equals(employee.getStatus())) {
                        throw new BusinessException("仅试用员工可以办理转正，员工状态已变化，请重新发起");
                    }
                    patch.setStatus(1);
                    patch.setRegularDate(transfer.getEffectiveDate());
                    stateGuard.eq(OrgEmployee::getStatus, 2);
                    break;
                case 3: // 调岗
                case 4: // 晋升
                    requireActiveOrProbation(employee, "离职员工不能办理调岗或晋升");
                    if (transfer.getToDeptId() == null && transfer.getToPostId() == null) {
                        throw new BusinessException("调岗或晋升必须设置目标部门或岗位");
                    }
                    if (transfer.getToDeptId() != null) {
                        patch.setDeptId(transfer.getToDeptId());
                    }
                    if (transfer.getToPostId() != null) {
                        patch.setPostId(transfer.getToPostId());
                    }
                    stateGuard.in(OrgEmployee::getStatus, 1, 2);
                    break;
                case 5: // 离职
                    validateResignDate(employee, transfer.getEffectiveDate());
                    requireActiveOrProbation(employee, "员工已离职或状态已变化，请勿重复审批");
                    patch.setStatus(3);
                    patch.setResignDate(transfer.getEffectiveDate());
                    stateGuard.in(OrgEmployee::getStatus, 1, 2);
                    break;
                default:
                    break;
            }
            if (employeeMapper.update(patch, stateGuard) <= 0) {
                throw new BusinessException("员工状态已变化，请刷新后重新办理");
            }
            if (patch.getStatus() != null) employee.setStatus(patch.getStatus());
            if (patch.getResignDate() != null) employee.setResignDate(patch.getResignDate());
            if (patch.getRegularDate() != null) employee.setRegularDate(patch.getRegularDate());
            if (patch.getDeptId() != null) employee.setDeptId(patch.getDeptId());
            if (patch.getPostId() != null) employee.setPostId(patch.getPostId());
            if (Integer.valueOf(5).equals(transfer.getTransferType())) {
                // 与异动审批共用同一事务：停用账号或会话失效失败时，审批和员工状态一并回滚。
                sysUserService.disableForResignation(employee.getUserId());
            }
        }
    }

    private void validateTransferAgainstCurrentEmployee(Integer transferType, LocalDate effectiveDate,
                                                         OrgEmployee employee) {
        switch (transferType) {
            case 2 -> {
                if (!Integer.valueOf(2).equals(employee.getStatus())) {
                    throw new BusinessException("仅试用员工可以发起转正");
                }
            }
            case 3, 4 -> requireActiveOrProbation(employee, "离职员工不能发起调岗或晋升");
            case 5 -> {
                requireActiveOrProbation(employee, "仅在职或试用员工可以发起离职");
                validateResignDate(employee, effectiveDate);
            }
            default -> throw new BusinessException("人事异动类型不合法");
        }
    }

    private void requireActiveOrProbation(OrgEmployee employee, String message) {
        if (employee == null || (!Integer.valueOf(1).equals(employee.getStatus())
                && !Integer.valueOf(2).equals(employee.getStatus()))) {
            throw new BusinessException(message);
        }
    }

    private void validateResignDate(OrgEmployee employee, LocalDate resignDate) {
        if (resignDate == null) {
            throw new BusinessException("离职生效日期不能为空");
        }
        if (resignDate.isAfter(LocalDate.now())) {
            throw new BusinessException("暂不支持预约未来离职");
        }
        if (employee.getHireDate() != null && resignDate.isBefore(employee.getHireDate())) {
            throw new BusinessException("离职日期不能早于入职日期");
        }
    }
}
