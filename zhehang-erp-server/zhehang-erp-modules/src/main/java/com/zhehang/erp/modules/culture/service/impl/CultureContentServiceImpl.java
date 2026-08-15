package com.zhehang.erp.modules.culture.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SafeHtmlSanitizer;
import com.zhehang.erp.modules.culture.domain.entity.CultureContent;
import com.zhehang.erp.modules.culture.mapper.CultureContentMapper;
import com.zhehang.erp.modules.culture.service.ICultureContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CultureContentServiceImpl extends ServiceImpl<CultureContentMapper, CultureContent>
        implements ICultureContentService {

    private static final Set<String> ALLOWED_TYPES = Set.of("policy", "culture", "culture_news", "honor", "feedback");
    private static final Pattern MOJIBAKE_PATTERN = Pattern.compile("�|Ã|Â|ðŸ|ä|å|æ|ç|è|é|娴|欐|澀|绠|悊|荤|粺|鍚|庣|锟");

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
        normalizeAndValidate(content);
        if (content.getId() != null) {
            boolean updated = this.updateById(content);
            if (!updated) {
                throw new BusinessException("人文内容不存在或已删除");
            }
        } else {
            boolean saved = this.save(content);
            if (!saved) {
                throw new BusinessException("人文内容保存失败");
            }
        }
    }

    private void normalizeAndValidate(CultureContent content) {
        if (content == null) {
            throw new BusinessException("人文内容不能为空");
        }
        content.setType(trimToNull(content.getType()));
        content.setTitle(trimToNull(content.getTitle()));
        content.setIcon(trimToNull(content.getIcon()));
        if (content.getContent() != null) {
            content.setContent(SafeHtmlSanitizer.sanitize(content.getContent().trim()));
        }
        if (!StringUtils.hasText(content.getType()) || !ALLOWED_TYPES.contains(content.getType())) {
            throw new BusinessException("人文内容类型不正确");
        }
        if (!StringUtils.hasText(content.getTitle())) {
            throw new BusinessException("请填写标题");
        }
        if (content.getTitle().length() > 128) {
            throw new BusinessException("标题不能超过128个字");
        }
        if (StringUtils.hasText(content.getIcon()) && content.getIcon().length() > 32) {
            throw new BusinessException("图标不能超过32个字符");
        }
        if (content.getContent() != null && content.getContent().length() > 50000) {
            throw new BusinessException("内容过长,请拆分为多条发布");
        }
        if (content.getSortOrder() == null) {
            content.setSortOrder(0);
        }
        if (content.getStatus() == null) {
            content.setStatus(1);
        }
        if (containsMojibake(content.getTitle()) || containsMojibake(content.getContent()) || containsMojibake(content.getIcon())) {
            throw new BusinessException("内容疑似乱码,请重新输入后保存");
        }
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private boolean containsMojibake(String value) {
        return StringUtils.hasText(value) && MOJIBAKE_PATTERN.matcher(value).find();
    }
}
