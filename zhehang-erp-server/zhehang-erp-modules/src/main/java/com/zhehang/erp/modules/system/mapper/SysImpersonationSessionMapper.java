package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.dto.ImpersonationCandidateRow;
import com.zhehang.erp.modules.system.domain.entity.SysImpersonationSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface SysImpersonationSessionMapper extends BaseMapper<SysImpersonationSession> {

    List<ImpersonationCandidateRow> selectCandidates(@Param("tenantId") Long tenantId,
                                                      @Param("keyword") String keyword,
                                                      @Param("deptId") Long deptId,
                                                      @Param("limit") int limit);

    ImpersonationCandidateRow selectCandidateByUserId(@Param("tenantId") Long tenantId,
                                                       @Param("userId") Long userId);

    int markExpiredSessions(@Param("now") LocalDateTime now);
}
