package com.zhehang.erp.modules.dashboard.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoVO {
    private Long id;
    private String title;
    private String type;
    private String priority;
    private String status;
    private String dueDate;
    private String link;
}
