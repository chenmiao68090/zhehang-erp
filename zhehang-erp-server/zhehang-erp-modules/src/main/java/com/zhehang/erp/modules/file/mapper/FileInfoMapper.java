package com.zhehang.erp.modules.file.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.file.domain.entity.FileInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FileInfoMapper extends BaseMapper<FileInfo> {

    /** 回收站安全检查专用：自定义 SQL 保留逻辑删除记录，租户插件仍会追加租户条件。 */
    @Select("SELECT id, access_scope, create_by, deleted FROM file_info WHERE id = #{id} LIMIT 1")
    FileInfo selectIncludingDeletedById(@Param("id") Long id);

    /** 回收站列表：绕过 @TableLogic 自动追加的 deleted=0，显式查软删除记录。分页插件自动处理 Page。 */
    @Select("SELECT * FROM file_info WHERE deleted = 1 ORDER BY update_time DESC")
    IPage<FileInfo> selectRecycleBin(Page<FileInfo> page);
}
