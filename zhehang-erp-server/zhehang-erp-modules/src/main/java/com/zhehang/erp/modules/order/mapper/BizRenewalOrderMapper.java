package com.zhehang.erp.modules.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.order.domain.BizRenewalOrder;
import org.apache.ibatis.annotations.Mapper;

/**
 * 续费提单 Mapper。标准 CRUD 直接继承 BaseMapper,无需 XML。
 * 选人下拉复用 BizAddressOrderMapper.selectColleagues(前端直接调地址提单的 colleagues 接口)。
 */
@Mapper
public interface BizRenewalOrderMapper extends BaseMapper<BizRenewalOrder> {
}
