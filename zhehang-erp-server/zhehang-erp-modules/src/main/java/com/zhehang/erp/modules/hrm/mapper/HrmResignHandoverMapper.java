package com.zhehang.erp.modules.hrm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResignHandover;
import com.zhehang.erp.modules.hrm.domain.vo.OffboardingSummaryVO;
import com.zhehang.erp.modules.hrm.domain.vo.ResignedStaffVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface HrmResignHandoverMapper extends BaseMapper<HrmResignHandover> {
    IPage<ResignedStaffVO> selectCenterPage(Page<?> page,
                                            @Param("name") String name,
                                            @Param("deptId") Long deptId,
                                            @Param("status") Integer status,
                                            @Param("riskOnly") Boolean riskOnly);

    OffboardingSummaryVO selectCenterSummary();

    ResignedStaffVO selectCenterByEmployeeId(@Param("employeeId") Long employeeId);
}
