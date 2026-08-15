package com.zhehang.erp.modules.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinPayChannel;
import org.apache.ibatis.annotations.Mapper;

/**
 * 收款中心-收款渠道 Mapper。标准 CRUD 直接继承 BaseMapper,无需 XML。
 */
@Mapper
public interface FinPayChannelMapper extends BaseMapper<FinPayChannel> {
}
