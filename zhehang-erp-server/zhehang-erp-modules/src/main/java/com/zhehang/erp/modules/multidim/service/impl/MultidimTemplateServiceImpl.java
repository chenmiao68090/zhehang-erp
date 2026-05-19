package com.zhehang.erp.modules.multidim.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.multidim.domain.entity.MultidimTemplate;
import com.zhehang.erp.modules.multidim.mapper.MultidimTemplateMapper;
import com.zhehang.erp.modules.multidim.service.IMultidimTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MultidimTemplateServiceImpl extends ServiceImpl<MultidimTemplateMapper, MultidimTemplate> implements IMultidimTemplateService {

    private final MultidimTemplateMapper templateMapper;

    @Override
    public List<MultidimTemplate> listByCategory(String category) {
        LambdaQueryWrapper<MultidimTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(category), MultidimTemplate::getCategory, category)
               .orderByAsc(MultidimTemplate::getId);
        return templateMapper.selectList(wrapper);
    }
}
