package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashSavedViewRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashSavedView;
import com.zhehang.erp.modules.finance.mapper.FinCashSavedViewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;
import java.util.Set;

/** 个人/公共保存视图，配置只允许 JSON 对象且限制大小。 */
@Service
@RequiredArgsConstructor
public class CashSavedViewService {
    private static final Set<String> ROOT_KEYS = Set.of(
            "filters", "dateRange", "visibleColumns", "pageSize", "filterExpanded");
    private static final Set<String> FILTER_KEYS = Set.of(
            "keyword", "matchStatus", "reviewStatus", "exceptionStatus", "paymentMethod", "receiveAccount",
            "customerName", "payerName", "amountMin", "amountMax", "onlyUnmatched", "includeVoid",
            "fundNature", "ownerId");
    private static final Set<String> BOOLEAN_FILTER_KEYS = Set.of("onlyUnmatched", "includeVoid");
    private static final Set<String> NUMBER_FILTER_KEYS = Set.of("amountMin", "amountMax", "ownerId");
    private static final Set<String> COLUMN_KEYS = Set.of("account", "owner", "exception", "time");

    private final FinCashSavedViewMapper viewMapper;
    private final ObjectMapper objectMapper;

    public List<FinCashSavedView> list() {
        Long uid = SecurityUtils.getCurrentUserId();
        return viewMapper.selectList(new LambdaQueryWrapper<FinCashSavedView>()
                .and(w -> w.eq(FinCashSavedView::getVisibility, "public")
                        .or(n -> n.eq(FinCashSavedView::getVisibility, "personal")
                                .eq(FinCashSavedView::getOwnerId, uid)))
                .orderByDesc(FinCashSavedView::getIsDefault)
                .orderByAsc(FinCashSavedView::getSortOrder)
                .orderByAsc(FinCashSavedView::getViewName));
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashSavedView save(Long id, CashSavedViewRequest request) {
        validate(request);
        Long uid = SecurityUtils.getCurrentUserId();
        FinCashSavedView entity;
        if (id == null) {
            entity = new FinCashSavedView();
            entity.setVersion(0);
        } else {
            entity = requireEditable(id);
            if (request.getVersion() != null && !Objects.equals(request.getVersion(), entity.getVersion())) {
                throw new BusinessException("视图已被其他人更新，请刷新后重试");
            }
        }
        String visibility = "public".equals(request.getVisibility()) ? "public" : "personal";
        if ("public".equals(visibility) && !canManagePublic()) {
            throw new BusinessException("仅财务负责人/老板/管理员可维护公共视图");
        }
        entity.setViewName(request.getViewName().trim());
        entity.setVisibility(visibility);
        entity.setOwnerId("public".equals(visibility) ? 0L : uid);
        entity.setConfigJson(request.getConfigJson().trim());
        entity.setIsDefault(Boolean.TRUE.equals(request.getDefaultView()) ? 1 : 0);
        entity.setSortOrder(request.getSortOrder() == null ? 100 : Math.max(0, request.getSortOrder()));
        if (entity.getIsDefault() == 1) clearDefault(entity.getVisibility(), entity.getOwnerId(), entity.getId());
        try {
            int changed = entity.getId() == null ? viewMapper.insert(entity) : viewMapper.updateById(entity);
            if (changed == 0) throw new BusinessException("视图已被其他人更新，请刷新后重试");
        } catch (DuplicateKeyException e) {
            throw new BusinessException("同范围内已存在同名视图");
        }
        return viewMapper.selectById(entity.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public void remove(Long id) {
        FinCashSavedView entity = requireEditable(id);
        viewMapper.deleteById(entity.getId());
    }

    private FinCashSavedView requireEditable(Long id) {
        FinCashSavedView entity = viewMapper.selectById(id);
        if (entity == null) throw new BusinessException("保存视图不存在");
        if ("public".equals(entity.getVisibility())) {
            if (!canManagePublic()) throw new BusinessException("仅财务负责人/老板/管理员可维护公共视图");
        } else if (!Objects.equals(entity.getOwnerId(), SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("不能修改其他人的个人视图");
        }
        return entity;
    }

    private void clearDefault(String visibility, Long ownerId, Long exceptId) {
        viewMapper.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<FinCashSavedView>()
                .eq(FinCashSavedView::getVisibility, visibility)
                .eq(FinCashSavedView::getOwnerId, ownerId)
                .eq(FinCashSavedView::getIsDefault, 1)
                .ne(exceptId != null, FinCashSavedView::getId, exceptId)
                .set(FinCashSavedView::getIsDefault, 0));
    }

    private void validate(CashSavedViewRequest request) {
        if (request == null || !StringUtils.hasText(request.getViewName())) throw new BusinessException("视图名称不能为空");
        if (request.getViewName().trim().length() > 80) throw new BusinessException("视图名称不能超过80个字");
        if (!StringUtils.hasText(request.getConfigJson()) || request.getConfigJson().length() > 12000) {
            throw new BusinessException("视图配置为空或过大");
        }
        try {
            JsonNode node = objectMapper.readTree(request.getConfigJson());
            if (node == null || !node.isObject()) throw new BusinessException("视图配置必须是 JSON 对象");
            assertAllowedKeys(node, ROOT_KEYS, "视图根配置");
            JsonNode filters = node.get("filters");
            if (filters != null && (!filters.isObject())) throw new BusinessException("视图筛选配置必须是 JSON 对象");
            if (filters != null) {
                assertAllowedKeys(filters, FILTER_KEYS, "视图筛选配置");
                filters.fields().forEachRemaining(entry -> {
                    JsonNode value = entry.getValue();
                    if (BOOLEAN_FILTER_KEYS.contains(entry.getKey()) && !value.isBoolean()) {
                        throw new BusinessException("视图布尔筛选值格式不正确");
                    }
                    if (NUMBER_FILTER_KEYS.contains(entry.getKey()) && !value.isNumber()) {
                        throw new BusinessException("视图数值筛选值格式不正确");
                    }
                    if (!BOOLEAN_FILTER_KEYS.contains(entry.getKey()) && !NUMBER_FILTER_KEYS.contains(entry.getKey())
                            && !value.isTextual()) {
                        throw new BusinessException("视图文本筛选值格式不正确");
                    }
                });
            }
            JsonNode columns = node.get("visibleColumns");
            if (columns != null && !columns.isObject()) throw new BusinessException("字段显隐配置必须是 JSON 对象");
            if (columns != null) {
                assertAllowedKeys(columns, COLUMN_KEYS, "字段显隐配置");
                columns.elements().forEachRemaining(value -> {
                    if (!value.isBoolean()) throw new BusinessException("字段显隐值必须是布尔值");
                });
            }
            JsonNode dateRange = node.get("dateRange");
            if (dateRange != null && !dateRange.isNull() && (!dateRange.isArray() || dateRange.size() != 2)) {
                throw new BusinessException("视图日期范围格式不正确");
            }
            if (dateRange != null && dateRange.isArray()) {
                dateRange.elements().forEachRemaining(value -> {
                    if (!value.isTextual() || !value.asText().matches("\\d{4}-\\d{2}-\\d{2}")) {
                        throw new BusinessException("视图日期范围格式不正确");
                    }
                });
            }
            JsonNode pageSize = node.get("pageSize");
            if (pageSize != null && (!pageSize.isIntegralNumber() || !pageSize.canConvertToInt()
                    || !Set.of(20, 50, 100).contains(pageSize.intValue()))) {
                throw new BusinessException("视图分页大小不合法");
            }
            JsonNode expanded = node.get("filterExpanded");
            if (expanded != null && !expanded.isBoolean()) throw new BusinessException("视图展开状态不合法");
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("视图配置格式不正确");
        }
    }

    private void assertAllowedKeys(JsonNode node, Set<String> allowed, String label) {
        node.fieldNames().forEachRemaining(key -> {
            if (!allowed.contains(key)) throw new BusinessException(label + "包含不支持的字段:" + key);
        });
    }

    private boolean canManagePublic() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }
}
