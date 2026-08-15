package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.entity.SysDictType;

public interface ISysDictTypeService extends IService<SysDictType> {

    /** 分页查询字典类型 */
    IPage<SysDictType> selectPage(int pageNum, int pageSize, String dictName, String dictType, Integer status);

    /** 新增字典类型(校验编码唯一) */
    void addType(SysDictType type);

    /** 修改字典类型；已登记字段的稳定编码不可修改。 */
    void updateType(SysDictType type);

    /** 删除未绑定且没有选项的空类型；已绑定类型只允许停用。 */
    void removeTypeCascade(Long id);
}
