package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import com.zhehang.erp.modules.hrm.domain.vo.OffboardingSummaryVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffDetailVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffVO;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 离职交接台账 service(飞书建议 160)。
 * 管理端(list/save/getByEmployee)限 HR/管理员/老板。
 */
public interface IHrmResignHandoverService extends IService<HrmResignHandover> {

    /** 按员工/状态查交接记录列表(降序按创建时间)。 */
    List<HrmResignHandover> listRecords(Long employeeId, Integer status);

    /** 新增/编辑交接记录(有 id 则更新)。 */
    void saveOrUpdateRecord(HrmResignHandover record);

    /** 取某员工的全部交接记录。 */
    List<HrmResignHandover> getByEmployee(Long employeeId);

    /** 离职人员中心：只返回安全字段，每名离职员工一行。 */
    IPage<ResignedStaffVO> selectCenterPage(int pageNum, int pageSize, String name,
                                            Long deptId, Integer status, Boolean riskOnly);

    /** 离职人员中心汇总卡片。 */
    OffboardingSummaryVO getCenterSummary();

    /** 离职人员详情、全部交接记录与真实时间轴。 */
    ResignedStaffDetailVO getCenterDetail(Long employeeId);

    /** 上传后立即标记为离职敏感附件，禁止普通员工从共享文件口读取。 */
    FileInfo uploadProtectedSop(MultipartFile file);
}
