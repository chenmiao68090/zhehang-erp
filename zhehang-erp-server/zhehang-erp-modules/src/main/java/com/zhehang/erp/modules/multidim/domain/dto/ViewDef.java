package com.zhehang.erp.modules.multidim.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class ViewDef {
    /** 视图ID */
    private String id;
    /** 视图名称 */
    private String name;
    /** 视图类型: grid/kanban/gantt/calendar/gallery */
    private String type;
    /** 筛选配置 */
    private List<FilterCondition> filterConfig;
    /** 排序配置 */
    private List<SortCondition> sortConfig;
    /** 分组字段ID */
    private String groupBy;

    @Data
    public static class FilterCondition {
        private String fieldId;
        private String operator;
        private Object value;
    }

    @Data
    public static class SortCondition {
        private String fieldId;
        private String direction;
    }
}
