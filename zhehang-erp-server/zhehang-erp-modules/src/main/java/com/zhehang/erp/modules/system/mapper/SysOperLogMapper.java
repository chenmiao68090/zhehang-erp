package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysOperLogMapper extends BaseMapper<SysOperLog> {

    /** 只允许把指定“处理中”预审记录结束一次，避免迟到收尾覆盖既有结论。 */
    @Update("""
            UPDATE sys_oper_log
               SET status = #{finalStatus},
                   error_msg = #{errorMessage},
                   cost_time = #{costTime}
             WHERE id = #{auditId}
               AND status = #{processingStatus}
            """)
    int completeImpersonationAudit(@Param("auditId") Long auditId,
                                   @Param("processingStatus") int processingStatus,
                                   @Param("finalStatus") int finalStatus,
                                   @Param("errorMessage") String errorMessage,
                                   @Param("costTime") long costTime);
}
