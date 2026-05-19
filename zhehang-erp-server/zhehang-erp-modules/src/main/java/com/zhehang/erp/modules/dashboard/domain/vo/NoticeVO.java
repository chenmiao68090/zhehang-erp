package com.zhehang.erp.modules.dashboard.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeVO {
    private Long id;
    private String title;
    private String type;
    private String publishTime;
    private String publisher;
}
