package com.zhehang.erp.modules.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FileInfoMapper extends BaseMapper<FileInfo> {

    /** 回收站安全检查专用：自定义 SQL 保留逻辑删除记录，租户插件仍会追加租户条件。 */
    @Select("SELECT id, access_scope, create_by, deleted FROM file_info WHERE id = #{id} LIMIT 1")
    FileInfo selectIncludingDeletedById(@Param("id") Long id);
}
