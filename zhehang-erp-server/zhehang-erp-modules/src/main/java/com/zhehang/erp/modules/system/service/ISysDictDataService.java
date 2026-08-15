package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.system.domain.entity.SysDictData;

import java.util.List;

public interface ISysDictDataService extends IService<SysDictData> {

    /** 某字典类型下的全部字典项(管理用,含停用,按 sort 升序) */
    List<SysDictData> listByType(String dictType);

    /** 某字典类型下"启用中"的字典项(前端下拉用,按 sort 升序) */
    List<SysDictData> listEnabledByType(String dictType);

    /** 新增已登记字段的选项，稳定值在保存后不可修改。 */
    void addData(SysDictData data);

    /** 修改标签、排序、默认、状态和备注，不允许修改稳定值。 */
    void updateData(SysDictData data);

    /** 仅允许删除未绑定类型的选项；正式字段一律使用停用。 */
    void removeDataSafely(Long id);
}
