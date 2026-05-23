package com.zhehang.erp.modules.system.domain.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationVO {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Boolean isRead;
    private String link;
    private LocalDateTime createTime;
    private String sender;
}
