package com.zhehang.erp.modules.review.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.review.domain.dto.ReviewActionDTO;
import com.zhehang.erp.modules.review.domain.dto.ReviewCreateDTO;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import com.zhehang.erp.modules.review.domain.vo.OrderReviewDetailVO;

import java.util.Map;

public interface OrderReviewService {

    /** 提单提交审核(地址/代账/续费提单):建审核单落「合同审理」节点等主管真人审;
     *  被主管/财务驳回过的同一提单再次提交时复位同一张审核单(唯一键一单一审)。返回审核单id。 */
    Long activateFromTicket(ReviewCreateDTO request);

    /** 合同审理(部门主管):通过→进入财务到款确认;驳回→回写源提单为已驳回。 */
    void contractReview(Long reviewId, ReviewActionDTO.NodeReview request);

    /** 到款确认(财务):通过→进入办事分配;驳回→回写源提单为已驳回。 */
    void paymentReview(Long reviewId, ReviewActionDTO.NodeReview request);
    IPage<OrderReview> list(int pageNum, int pageSize, String status, String keyword);

    Map<String, Long> stats();

    OrderReviewDetailVO detail(Long reviewId);

    Map<String, Object> downloadAttachment(Long reviewId, Long fileId);

    Long activateFromFinanceConfirmed(BizOrder order, Long financeUserId,
                                      Long financeApprovalId, String comment);

    void assignHandler(Long reviewId, ReviewActionDTO.AssignHandler request);

    void accept(Long reviewId, ReviewActionDTO.Accept request);

    void submitComplete(Long reviewId, ReviewActionDTO.SubmitComplete request);

    void confirmComplete(Long reviewId, ReviewActionDTO.ConfirmComplete request);
}
