package com.zhehang.erp.modules.task.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.task.domain.BizCommission;

public interface IBizCommissionService extends IService<BizCommission> {

    /** 结算单列表 */
    IPage<BizCommission> selectPage(int pageNum, int pageSize, Long salesmanId, String period, Integer status);

    /** 生成结算单 */
    Long generate(Long orderId, String period);

    /** 销售确认 */
    void salesmanConfirm(Long id, Long operatorId);

    /** 主管审核 */
    void review(Long id, boolean pass, String comment, Long operatorId);

    /** 财务确认 */
    void financeConfirm(Long id, Long operatorId);

    /** 老板审批(并标记发放) */
    void bossApprove(Long id, boolean approved, Long operatorId);
}
