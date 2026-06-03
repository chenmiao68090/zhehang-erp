package com.zhehang.erp.modules.contract.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.domain.BizContractTemplate;

import java.util.List;

public interface IBizContractService extends IService<BizContract> {

    /** 合同列表 */
    IPage<BizContract> selectPage(int pageNum, int pageSize, String contractNo, Long customerId, Integer status);

    /** 基于订单生成合同 */
    Long generateFromOrder(Long orderId, Long templateId, String title);

    /** 发送签署 */
    void sendSign(Long id, String signMode);

    /** 确认签署完成 */
    void confirmSign(Long id, String signerTheirs);

    /** 续签 */
    Long renew(Long id, String newTitle);

    /** 终止合同 */
    void terminate(Long id, String reason);

    /** 即将到期列表(默认30天) */
    List<BizContract> getExpiring(int days);

    /** 模板列表 */
    List<BizContractTemplate> listTemplates(String category, Integer status);

    /** 创建/更新模板 */
    Long saveTemplate(BizContractTemplate template);
}
