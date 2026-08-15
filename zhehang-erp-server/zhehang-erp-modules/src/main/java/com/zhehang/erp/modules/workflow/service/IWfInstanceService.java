package com.zhehang.erp.modules.workflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.workflow.domain.dto.WfResubmitDTO;
import com.zhehang.erp.modules.workflow.domain.dto.WfTaskQuery;
import com.zhehang.erp.modules.workflow.domain.vo.WfInstanceVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfTaskVO;

import java.util.List;
import java.util.Map;

/**
 * 流程实例服务
 */
public interface IWfInstanceService {

    /** 发起流程(纯审批,不做业务联动) */
    void startProcess(String processKey, String title, Map<String, Object> formData);

    /** 发起流程并关联业务单据:bizType 有值时按 ApprovalCallbackHandler 做业务联动(批完真生效) */
    void startProcess(String processKey, String title, Map<String, Object> formData, String bizType, Long bizId);

    /**
     * 代发起:指定发起人(审批链按该人解析部门主管/直属上级)。
     * 用于业务代发起审批(如 HR 建调岗单,审批链应按被调岗员工而非操作的 HR 解析)。
     * initiatorId 为空则回退当前登录人。
     */
    void startProcessAs(String processKey, String title, Map<String, Object> formData, String bizType, Long bizId, Long initiatorId);

    /** 审批通过 */
    void approve(Long taskId, String comment);

    /** 审批拒绝 */
    void reject(Long taskId, String comment);

    /** 转交 */
    void transfer(Long taskId, Long targetUserId, String comment);

    /** 退回修改:审批人把申请退回给发起人改(实例转待修改,不是拒绝) */
    void returnForRevision(Long taskId, String comment);

    /** 重新提交:发起人修改被退回的申请后重新从头流转 */
    void resubmit(Long instanceId, WfResubmitDTO dto);

    /** 催办:发起人提醒当前审批人尽快处理(同任务4小时限频) */
    void urge(Long taskId);

    /** 标记一条抄送为已读(仅本人) */
    void markCcRead(Long taskId);

    /** 设计器选审批人时的即时预警:给定审批人类型/值,返回 {ok, count, warning}(角色人数/未设上级人数) */
    Map<String, Object> previewAssignee(String assigneeType, String assigneeValue);

    /** 四个列表的一次性计数(待办/已办/抄送/已发起),供角标 */
    Map<String, Long> myCounts();

    /** 全公司审批监控列表(调用方须先做 boss/admin/hr 门禁) */
    IPage<WfInstanceVO> adminList(WfTaskQuery query, Integer status, Long initiatorId);

    /** 补充抄送:把审批实例抄送给指定同事(出现在对方「抄送我」列表) */
    void addCc(Long instanceId, List<Long> userIds);

    /** 撤销 */
    void cancel(Long instanceId);

    /** 删除我发起的非进行中流程记录 */
    void removeStarted(Long instanceId);

    /** 流程实例详情 */
    WfInstanceVO getDetail(Long instanceId);

    /** 我的待办(支持关键字/流程/时间段服务端筛选) */
    IPage<WfTaskVO> getMyTodo(WfTaskQuery query);

    /** 我的已办 */
    IPage<WfTaskVO> getMyDone(WfTaskQuery query);

    /** 我发起的 */
    IPage<WfInstanceVO> getMyStarted(WfTaskQuery query);

    /** 抄送我的 */
    IPage<WfTaskVO> getMyCc(WfTaskQuery query);

    /** 发布预检:校验流程每个审批节点都能解析到审批人;返回问题清单,空列表=通过 */
    List<String> precheckProcessDef(Long defId);
}
