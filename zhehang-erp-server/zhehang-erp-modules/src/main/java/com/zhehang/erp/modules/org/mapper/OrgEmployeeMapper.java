package com.zhehang.erp.modules.org.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.domain.vo.EmployeeContractExpiryVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeRosterVO;
import com.zhehang.erp.modules.org.domain.vo.EmployeeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface OrgEmployeeMapper extends BaseMapper<OrgEmployee> {
    /**
     * 分页查询员工列表（关联部门、岗位）
     */
    IPage<EmployeeVO> selectEmployeePage(Page<?> page,
                                          @Param("name") String name,
                                          @Param("deptId") Long deptId,
                                          @Param("postId") Long postId,
                                          @Param("status") Integer status,
                                          @Param("excludeResigned") Boolean excludeResigned);

    /**
     * 查询员工详情（关联部门、岗位）
     */
    EmployeeVO selectEmployeeById(@Param("id") Long id);

    /**
     * 全员花名册（仅 id/姓名/部门/岗位/状态,无身份证/手机等隐私字段）。
     * 供设假期额度等需要全员名单、但不应暴露 PII 的场景使用。
     */
    List<EmployeeRosterVO> selectRoster();

    /**
     * 在职/试用员工的全员选项（无 PII），供任务、审批等指派场景使用。
     */
    List<EmployeeRosterVO> selectActiveOptions();

    /** 合同即将到期的员工最小视图（无 PII/附件/账号字段）。 */
    List<EmployeeContractExpiryVO> selectContractExpiring(@Param("from") java.time.LocalDate from,
                                                           @Param("to") java.time.LocalDate to);

    /**
     * 统计某部门下的员工人数
     */
    int countByDeptId(@Param("deptId") Long deptId);

    /**
     * 一次性统计所有部门的在职人数(替代逐部门 countByDeptId,消除组织树 N+1)
     * @return 每行 {deptId, cnt}
     */
    List<Map<String, Object>> selectMemberCountGroupByDept();
}
