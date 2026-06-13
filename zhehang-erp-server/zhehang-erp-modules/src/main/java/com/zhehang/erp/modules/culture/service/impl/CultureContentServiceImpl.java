package com.zhehang.erp.modules.culture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.culture.domain.entity.CultureContent;
import com.zhehang.erp.modules.culture.mapper.CultureContentMapper;
import com.zhehang.erp.modules.culture.service.ICultureContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CultureContentServiceImpl extends ServiceImpl<CultureContentMapper, CultureContent>
        implements ICultureContentService {

    private final CultureContentMapper cultureContentMapper;

    @Override
    public List<CultureContent> listByType(String type) {
        LambdaQueryWrapper<CultureContent> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(type), CultureContent::getType, type)
               .orderByAsc(CultureContent::getSortOrder)
               .orderByAsc(CultureContent::getId);
        return cultureContentMapper.selectList(wrapper);
    }

    @Override
    public void upsert(CultureContent content) {
        if (content.getId() != null) {
            this.updateById(content);
        } else {
            this.save(content);
        }
    }
}
