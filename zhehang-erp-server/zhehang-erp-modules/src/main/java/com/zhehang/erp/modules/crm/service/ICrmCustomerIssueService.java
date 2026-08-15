package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssue;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 客户服务工单 Service。
 */
public interface ICrmCustomerIssueService extends IService<CrmCustomerIssue> {

    /** 分页列表(按当前用户数据范围收敛:老板看全部、主管看本部门、员工看与自己相关的) */
    IPage<CrmCustomerIssue> selectPage(int pageNum, int pageSize, String keyword, String status,
                                       Long ownerId, String priority, String issueType, Boolean overdue,
                                       Boolean openOnly, Boolean unhandled);

    /** 新建工单(自动生成编号、写流转记录) */
    Long createIssue(CrmCustomerIssue issue);

    /** 从聊天消息右键下发任务工单(主办人默认消息发送人,source=im,记录来源会话/消息) */
    Long createIssueFromMessage(Long messageId, String description, Long ownerId,
                                LocalDateTime deadline, String priority, String issueType,
                                Long customerId, String customerName);

    /** 编辑工单基础信息 */
    void updateIssue(CrmCustomerIssue issue);

    /** 分配/变更负责人与协助人 */
    void assign(Long id, Long ownerId, String ownerName, Long assistId, String assistName);

    /** 变更状态(改为已完成时必须有处理结果) */
    void changeStatus(Long id, String status, String result, String remark);

    /** 关闭工单 */
    void close(Long id, String remark);

    /** 工单详情(含流转记录时间线) */
    Map<String, Object> detail(Long id);

    /** 看板统计:今日新增/未处理/逾期/P0(按数据范围收敛) */
    Map<String, Object> stats();
}
