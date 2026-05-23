package com.zhehang.erp.modules.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.project.domain.entity.PmDoc;

import java.util.List;

public interface IPmDocService extends IService<PmDoc> {
    List<PmDoc> listByProject(Long projectId);
}
