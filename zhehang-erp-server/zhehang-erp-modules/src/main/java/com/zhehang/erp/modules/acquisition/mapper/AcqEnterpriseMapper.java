package com.zhehang.erp.modules.acquisition.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseCardVO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseQueryDTO;
import com.zhehang.erp.modules.acquisition.domain.dto.EnterpriseStatsVO;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterprise;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AcqEnterpriseMapper extends BaseMapper<AcqEnterprise> {

    /**
     * 分页查询企业卡片列表
     */
    IPage<EnterpriseCardVO> selectEnterprisePage(IPage<EnterpriseCardVO> page, @Param("q") EnterpriseQueryDTO query);

    /**
     * 查询企业统计信息
     */
    EnterpriseStatsVO selectStats(@Param("q") EnterpriseQueryDTO query);
}
