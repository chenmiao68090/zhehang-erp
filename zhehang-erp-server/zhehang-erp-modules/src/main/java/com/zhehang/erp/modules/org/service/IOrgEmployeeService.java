package com.zhehang.erp.modules.org.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.org.domain.dto.EmployeeDTO;
import com.zhehang.erp.modules.org.domain.dto.EmployeeResignDTO;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.vo.EmployeeContractExpiryVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeVO;
import com.zhehang.erp.modules.system.domain.vo.InitialCredentialVO;

import java.util.List;

public interface IOrgEmployeeService extends IService<OrgEmployee> {
    IPage<EmployeeVO> selectEmployeePage(int pageNum, int pageSize, String name, Long deptId, Long postId, Integer status);
    IPage<EmployeeVO> selectEmployeePage(int pageNum, int pageSize, String name, Long deptId, Long postId,
                                         Integer status, Boolean excludeResigned);
    EmployeeVO selectEmployeeById(Long id);
    /** 当前登录人本人的员工档案，不接收前端 ID。 */
    EmployeeVO selectCurrentEmployee();
    /** 全员花名册(无 PII):仅 HR/管理员/老板可取,口径同假期额度设置;无权返回空列表 */
    List<EmployeeRosterVO> selectRoster();
    /** 全员选人的最小字段列表，仅返回在职/试用员工。 */
    List<EmployeeRosterVO> selectEmployeeOptions();
    /** 即将到期的劳动合同，只返回提醒页所需最小字段。 */
    List<EmployeeContractExpiryVO> selectContractExpiring(int days);
    String generateNextEmpCode();
    InitialCredentialVO createEmployee(EmployeeDTO dto);
    InitialCredentialVO updateEmployee(EmployeeDTO dto);
    /** 立即办理离职；返聘只恢复档案状态，不在此处自动启用账号。 */
    void resignEmployee(Long employeeId, EmployeeResignDTO dto);
    void deleteEmployee(Long id);
    InitialCredentialVO resetEmployeePassword(Long employeeId);
    void updateEmployeeAccountStatus(Long employeeId, Boolean accountEnabled);
}
