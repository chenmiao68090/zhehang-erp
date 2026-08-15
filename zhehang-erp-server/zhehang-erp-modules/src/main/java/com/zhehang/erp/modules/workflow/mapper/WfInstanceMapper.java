package com.zhehang.erp.modules.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface WfInstanceMapper extends BaseMapper<WfInstance> {

    /** 悲观锁:锁住实例行,串行化同一实例的并发审批/驳回(防会签死锁、或签重复推进) */
    @Select("SELECT id FROM wf_instance WHERE id = #{id} FOR UPDATE")
    Long lockInstance(@Param("id") Long id);
}
