package com.zhehang.erp.modules.culture.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.culture.domain.entity.CultureContent;

import java.util.List;

public interface ICultureContentService extends IService<CultureContent> {

    /** 按类型查询启用中的内容列表（按 sortOrder 升序、id 升序）。type 为空则返回全部。 */
    List<CultureContent> listByType(String type);

    /** 新增或编辑（有 id 走更新，无 id 走新增）。 */
    void upsert(CultureContent content);
}
