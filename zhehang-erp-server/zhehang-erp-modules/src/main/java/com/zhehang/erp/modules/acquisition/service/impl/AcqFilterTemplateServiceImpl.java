package com.zhehang.erp.modules.acquisition.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.acquisition.domain.entity.AcqFilterTemplate;
import com.zhehang.erp.modules.acquisition.mapper.AcqFilterTemplateMapper;
import com.zhehang.erp.modules.acquisition.service.IAcqFilterTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcqFilterTemplateServiceImpl extends ServiceImpl<AcqFilterTemplateMapper, AcqFilterTemplate>
        implements IAcqFilterTemplateService {

    @Override
    public List<AcqFilterTemplate> listByUser(Long userId) {
        LambdaQueryWrapper<AcqFilterTemplate> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(userId != null, AcqFilterTemplate::getUserId, userId)
                .orderByDesc(AcqFilterTemplate::getIsDefault)
                .orderByDesc(AcqFilterTemplate::getUpdateTime);
        return list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveTemplate(AcqFilterTemplate template) {
        if (template == null || !StringUtils.hasText(template.getTemplateName())) {
            throw new BusinessException("模板名称不能为空");
        }
        if (template.getId() == null) {
            save(template);
        } else {
            updateById(template);
        }
    }
}
