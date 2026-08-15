package com.zhehang.erp.modules.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.workflow.domain.dto.WfTaskQuery;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;
import com.zhehang.erp.modules.workflow.domain.vo.WfColleagueVO;
import com.zhehang.erp.modules.workflow.domain.vo.WfTaskVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface WfTaskMapper extends BaseMapper<WfTask> {

    /**
     * 查询我的待办列表(q: 关键字/流程/时间段服务端筛选,可空)
     */
    IPage<WfTaskVO> selectTodoPage(Page<WfTaskVO> page, @Param("assigneeId") Long assigneeId, @Param("q") WfTaskQuery q);

    /**
     * 查询我的已办列表
     */
    IPage<WfTaskVO> selectDonePage(Page<WfTaskVO> page, @Param("assigneeId") Long assigneeId, @Param("q") WfTaskQuery q);

    /**
     * 查询抄送我的列表(node_type=cc 的抄送记录)
     */
    IPage<WfTaskVO> selectCcPage(Page<WfTaskVO> page, @Param("assigneeId") Long assigneeId, @Param("q") WfTaskQuery q);

    /**
     * 审批选人下拉(抄送/转交):所有已开通账号的员工,与 order/gs 模块 colleagues 同口径。
     */
    @Select("SELECT e.user_id AS userId, e.name AS name, d.dept_name AS deptName "
            + "FROM org_employee e "
            + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted = 0 "
            + "WHERE e.deleted = 0 AND e.user_id IS NOT NULL "
            + "ORDER BY e.dept_id, e.name")
    List<WfColleagueVO> selectColleagues();
}
