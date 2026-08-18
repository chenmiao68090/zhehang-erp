package com.zhehang.erp.modules.file.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.file.domain.entity.KbArticle;
import com.zhehang.erp.modules.file.mapper.KbArticleMapper;
import com.zhehang.erp.modules.file.service.IKbArticleService;
import com.zhehang.erp.common.core.utils.SafeHtmlSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class KbArticleServiceImpl extends ServiceImpl<KbArticleMapper, KbArticle> implements IKbArticleService {

    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<KbArticle> getArticleList(Integer pageNum, Integer pageSize, Long categoryId, String keyword) {
        LambdaQueryWrapper<KbArticle> wrapper = new LambdaQueryWrapper<>();
        if (categoryId != null) {
            wrapper.eq(KbArticle::getCategoryId, categoryId);
        }
        if (StringUtils.hasText(keyword)) {
            wrapper.like(KbArticle::getTitle, keyword);
        }
        wrapper.orderByDesc(KbArticle::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public KbArticle getArticleDetail(Long id) {
        KbArticle article = getById(id);
        if (article != null) {
            // Increment view count
            update(new LambdaUpdateWrapper<KbArticle>()
                    .eq(KbArticle::getId, id)
                    .setSql("view_count = view_count + 1"));
            article.setViewCount((article.getViewCount() == null ? 0 : article.getViewCount()) + 1);
        }
        return article;
    }

    @Override
    public void createArticle(KbArticle article) {
        article.setContent(SafeHtmlSanitizer.sanitize(article.getContent()));
        if (article.getViewCount() == null) {
            article.setViewCount(0);
        }
        if (article.getLikeCount() == null) {
            article.setLikeCount(0);
        }
        if (article.getStatus() == null) {
            article.setStatus(0); // 0=draft
        }
        if (article.getContentType() == null) {
            article.setContentType("markdown");
        }
        save(article);
    }

    @Override
    public void updateArticle(KbArticle article) {
        checkArticleOwner(article.getId());
        article.setContent(SafeHtmlSanitizer.sanitize(article.getContent()));
        updateById(article);
    }

    @Override
    public void deleteArticle(Long id) {
        checkArticleOwner(id);
        removeById(id);
    }

    @Override
    public void publishArticle(Long id) {
        checkArticleOwner(id);
        update(new LambdaUpdateWrapper<KbArticle>()
                .eq(KbArticle::getId, id)
                .set(KbArticle::getStatus, 1)); // 1=published
    }

    @Override
    public void archiveArticle(Long id) {
        checkArticleOwner(id);
        update(new LambdaUpdateWrapper<KbArticle>()
                .eq(KbArticle::getId, id)
                .set(KbArticle::getStatus, 2)); // 2=archived
    }

    /** 越权校验:仅文章创建人或管理员可改/删/发布/归档 */
    private void checkArticleOwner(Long id) {
        KbArticle existing = getById(id);
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            throw new BusinessException("无权操作他人文章");
        }
    }

    @Override
    public IPage<KbArticle> getRecentArticles(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<KbArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(KbArticle::getStatus, 1) // published only
                .orderByDesc(KbArticle::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public IPage<KbArticle> getHotArticles(Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<KbArticle> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(KbArticle::getStatus, 1) // published only
                .orderByDesc(KbArticle::getViewCount);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void likeArticle(Long id) {
        update(new LambdaUpdateWrapper<KbArticle>()
                .eq(KbArticle::getId, id)
                .setSql("like_count = like_count + 1"));
    }
}
