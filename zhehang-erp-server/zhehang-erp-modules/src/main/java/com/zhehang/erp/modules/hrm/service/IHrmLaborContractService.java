package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLaborContract;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 劳动合同管理 service(飞书建议 161)。
 */
public interface IHrmLaborContractService extends IService<HrmLaborContract> {

    /** HR 端分页 + 各状态计数(生效/即将到期/已到期/已终止)。返回 {page, counts}。 */
    Map<String, Object> hrPage(int pageNum, int pageSize, Long employeeId, String contractType,
                               Integer status, LocalDate endFrom, LocalDate endTo);

    /** 新增/编辑(有 id 则更新)。 */
    void saveOrUpdateContract(HrmLaborContract contract);

    /** 删除一份合同。 */
    void deleteContract(Long id);

    /** 即将到期:end_date 在未来 days 天内、状态非「已终止」的合同列表。 */
    List<HrmLaborContract> expiring(int days);

    /** 对即将到期的合同,给员工本人发一条站内到期提醒;拿不到 userId 就跳过。返回实际提醒条数。 */
    int remindExpiring(int days);

    /** 员工自助:当前登录用户查自己的劳动合同列表。 */
    List<HrmLaborContract> myList();
}
