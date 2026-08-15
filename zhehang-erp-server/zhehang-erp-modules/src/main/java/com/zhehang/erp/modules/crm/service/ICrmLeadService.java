package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;

import java.util.List;

public interface ICrmLeadService extends IService<CrmLead> {
    IPage<CrmLead> selectPage(int pageNum, int pageSize, String name, Integer source, Integer status, Long ownerId);
    void convertToCustomer(Long id);
    void assignLead(Long id, Long ownerId);
    void updateLead(CrmLead lead);
    void removeLead(Long id);
    void markInvalid(Long id, String reason);

    /** 人工录入线索：执行每日额度与防重复校验后再落库。 */
    void createManualLead(CrmLead lead);

    /** 公海列表:归属为 pool 的线索 */
    IPage<CrmLead> selectPoolPage(int pageNum, int pageSize, String name, Long poolId,
                                  Integer source, Integer status, String customerLevel);

    /** 我的客资:当前登录人名下、归属 private 的线索;scope=all 时老板/主管按数据范围看全部/本部门(员工强制回本人) */
    IPage<CrmLead> selectMyPage(int pageNum, int pageSize, String name, Integer source,
                                Integer status, String followStatus, String intentLevel, String scope);

    /**
     * 今天该打谁:数据范围内(电销看自己/主管看部门)、归属 private、
     * 且"下次跟进时间已到/逾期或从未设置"的线索,按紧迫度排序。供电销每日跟进待办用。
     */
    IPage<CrmLead> selectTodoFollow(int pageNum, int pageSize, String name, Integer source,
                                    String followStatus, String intentLevel, String scope);

    /**
     * 回收预警:数据范围内、持有(private)未转化、保护期将在数天内到期的客资,
     * 提醒电销尽快跟进以免被自动回收。配合 autoRecycle 一起服务"今天该打谁"。
     */
    IPage<CrmLead> selectRecycleWarning(int pageNum, int pageSize, String name, Integer source,
                                        String followStatus, String intentLevel, String scope);

    /** 领取:把公海线索领到当前登录人名下(置 private、记领取时间) */
    void claim(List<Long> ids);

    /** 领取历史客资到本人：员工限本人历史，主管可领取管理范围内历史；保留原跟进审计。 */
    void reactivateHistory(List<Long> ids);

    /** 退回公海:清空负责人、归属置 pool */
    void returnToPool(List<Long> ids, String reason);

    /**
     * 自动回收:把"持有(private)且未转化、已过保护期、久未跟进"的线索批量退回公海,
     * 并给原跟进人加冷却、累加回收次数、记回收时间。由定时任务每日触发,也可管理员手动跑。
     * 落地 boss 要求的"没跟进自动回收"。返回本次回收条数。
     */
    int autoRecycle();

    /** 分配:批量指派负责人并置为 private */
    void distribute(List<Long> ids, Long ownerId);

    /**
     * 给线索写一条跟进记录,并回写线索的最后跟进时间/跟进次数/下次跟进(供回收引擎判超时)。
     * 仅当前用户在数据范围内(本人/本部门/管理员)可跟进,否则越权拒绝。
     */
    void addFollow(Long leadId, CrmLeadFollowDTO follow);

    /** 内部闭环调用:结束型结果可以不再创建下一步任务,普通跟进入口不得放宽。 */
    void addFollow(Long leadId, CrmLeadFollowDTO follow, boolean allowWithoutNextAction);

    /** 我的销售工作台全量统计,不能用当前分页数据冒充。 */
    java.util.Map<String, Object> workbenchSummary(String scope);

    /** 查重:按手机号/名称匹配已存在线索 */
    List<CrmLead> checkDuplicate(String phone, String name);

    /** 从工商库按关键词批量导入企业为公海线索(去重+自动补工商),返回新建数量。"新公司入池" */
    int importFromCompanyLibrary(String keyword, int limit);

    /** 线索来源分布:按 source 聚合数量(营销统计用) */
    List<java.util.Map<String, Object>> sourceStats();

    /** 线索阶段漏斗:按 status 聚合数量(营销统计用) */
    List<java.util.Map<String, Object>> stageStats();

    /** 转化率汇总(数据范围内:电销看自己/主管看部门):总数/各阶段数/转化率,供复盘看板 */
    java.util.Map<String, Object> conversionSummary();

    /**
     * 投流客资汇总(飞书 164 顶部滚动播报):返回本月/本年两组聚合。
     * 数据范围内(电销看自己/主管看部门/管理员看全部),按 create_time 落在本月/本年过滤。
     * 每组含:有效客资、刻章有效、非刻章有效、非刻章转化、非刻章转化率、非刻章成交额。
     */
    java.util.Map<String, Object> touliuSummary();
}
