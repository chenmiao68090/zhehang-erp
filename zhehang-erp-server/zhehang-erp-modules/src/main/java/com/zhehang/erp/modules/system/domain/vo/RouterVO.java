package com.zhehang.erp.modules.system.domain.vo;

import lombok.Data;
import java.util.List;

@Data
public class RouterVO {
    private String name;
    private String path;
    private String component;
    private String redirect;
    private MetaVO meta;
    private List<RouterVO> children;

    @Data
    public static class MetaVO {
        private String title;
        private String icon;
        private boolean hidden;
        private boolean keepAlive;
    }
}