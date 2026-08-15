package com.zhehang.erp.modules.org.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.org.domain.entity.OrgTransfer;
import com.zhehang.erp.modules.org.mapper.OrgTransferMapper;
import com.zhehang.erp.modules.org.service.IOrgTransferService;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 调岗/异动审批联动:org_transfer 单接 wf transfer 流程。
 * 建单方(OrgTransferController.add)负责发起 wf 并带 bizId;
 * 通过 → 调既有 approveTransfer(执行部门/岗位变更),驳回 → 置2,撤销 → 逻辑删。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrgTransferApprovalHandler implements ApprovalCallbackHandler {

    public static final String BIZ_TYPE = "org_transfer";

    private final OrgTransferMapper transferMapper;
    private final IOrgTransferService transferService;

    @Override
    public String bizType() {
        return BIZ_TYPE;
    }

    @Override
    public void onApproved(WfInstance instance) {
        require(instance);
        // 审批人 = 本次通过动作的当前登录人(回调在审批事务内执行)
        transferService.approveTransfer(instance.getBizId(), 1, SecurityUtils.getCurrentUserId());
    }

    @Override
    public void onRejected(WfInstance instance) {
        require(instance);
        transferService.approveTransfer(instance.getBizId(), 2, SecurityUtils.getCurrentUserId());
    }

    @Override
    public void onCancelled(WfInstance instance) {
        OrgTransfer t = instance.getBizId() == null ? null : transferMapper.selectById(instance.getBizId());
        if (t != null && t.getStatus() != null && t.getStatus() == 0) {
            transferMapper.deleteById(t.getId());
        }
    }

    private void require(WfInstance instance) {
        OrgTransfer t = instance.getBizId() == null ? null : transferMapper.selectById(instance.getBizId());
        if (t == null) {
            throw new BusinessException("审批关联的异动单不存在(bizId=" + instance.getBizId() + "),请联系管理员");
        }
        if (t.getStatus() == null || t.getStatus() != 0) {
            throw new BusinessException("异动单已处理过,请勿重复审批");
        }
    }
}
