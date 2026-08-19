package com.zhehang.erp.modules.crm.mapper;

import com.baomidou.mybatisplus.annotation.InterceptorIgnore;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BizCallRecordMapper extends BaseMapper<BizCallRecord> {

    /**
     * 按外呼平台话单ID查冲突行,跨租户且包含已软删除的行。
     *
     * <p>唯一键 {@code uk_call_record_platform_id} 只建在 {@code platform_call_id} 单列上,不含
     * {@code tenant_id}。存量话单有大量 {@code tenant_id} 为 NULL 的历史行,带租户条件的查询看不到它们,
     * 插入时却会撞唯一键,导致云客同步持续抛 DuplicateKeyException。</p>
     *
     * <p>因此这里必须绕开租户拦截器与逻辑删除,先探明真正占用唯一键的那一行;调用方再比对
     * {@code tenant_id} 决定更新还是跳过,绝不跨租户覆盖。</p>
     */
    @InterceptorIgnore(tenantLine = "true")
    @Select("SELECT * FROM biz_call_record WHERE platform_call_id = #{platformCallId} LIMIT 1")
    BizCallRecord selectAnyByPlatformCallId(@Param("platformCallId") String platformCallId);
}
