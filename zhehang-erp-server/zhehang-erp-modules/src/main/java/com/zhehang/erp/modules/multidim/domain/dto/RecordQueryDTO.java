package com.zhehang.erp.modules.multidim.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecordQueryDTO {
    /** 表格ID */
    private Long tableId;
    /** 视图ID */
    private String viewId;
    /** 筛选条件 */
    private List<ViewDef.FilterCondition> filters;
    /** 排序条件 */
    private List<ViewDef.SortCondition> sorts;
    /** 页码 */
    private Integer pageNum = 1;
    /** 每页条数 */
    private Integer pageSize = 20;
    /** 搜索关键字 */
    private String keyword;
}
