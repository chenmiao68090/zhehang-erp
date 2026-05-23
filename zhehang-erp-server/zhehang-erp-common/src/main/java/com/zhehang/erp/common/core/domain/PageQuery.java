package com.zhehang.erp.common.core.domain;

import lombok.Data;

@Data
public class PageQuery {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String orderByColumn;
    private String isAsc = "asc";
}