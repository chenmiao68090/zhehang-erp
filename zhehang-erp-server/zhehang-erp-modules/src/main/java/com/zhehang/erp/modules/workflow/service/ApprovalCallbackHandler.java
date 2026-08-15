package com.zhehang.erp.modules.workflow.service;

import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;

/**
 * 审批-业务联动回调 SPI:业务模块实现本接口并注册为 Spring bean,
 * 引擎按 wf_instance.biz_type 分发,让"批完真生效"(请假批了考勤才认、报销批了单据才过账)。
 *
 * <p>回调与审批动作在同一事务里执行:业务回写失败会连同审批动作一起回滚,
 * 绝不允许"审批显示通过、业务没记上"的状态劈叉。</p>
 */
public interface ApprovalCallbackHandler {

    /** 本处理器负责的业务类型(与 wf_instance.biz_type 对应,如 hrm_leave / fin_reimburse / org_transfer) */
    String bizType();

    /** 发起成功后(实例已落库):可在此创建/绑定业务单据,返回业务ID回填 wf_instance.biz_id;返回 null 表示沿用发起时传入的 biz_id */
    default Long onStarted(WfInstance instance) {
        return null;
    }

    /** 被退回后发起人重新提交(表单已更新):同步业务单据内容并回到待审状态 */
    default void onResubmitted(WfInstance instance) {
    }

    /** 全链审批通过后 */
    default void onApproved(WfInstance instance) {
    }

    /** 被拒绝后 */
    default void onRejected(WfInstance instance) {
    }

    /** 发起人撤销后 */
    default void onCancelled(WfInstance instance) {
    }
}
