package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

/** 保存视图新增/编辑请求。 */
@Data
public class CashSavedViewRequest {
    private String viewName;
    private String visibility;
    private String configJson;
    private Boolean defaultView;
    private Integer sortOrder;
    private Integer version;
}
