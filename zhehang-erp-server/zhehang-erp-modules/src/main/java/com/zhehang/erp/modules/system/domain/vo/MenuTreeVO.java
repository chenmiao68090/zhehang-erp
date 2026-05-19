package com.zhehang.erp.modules.system.domain.vo;

import lombok.Data;
import java.util.List;

@Data
public class MenuTreeVO {
    private Long id;
    private String label;
    private Long parentId;
    private Integer orderNum;
    private List<MenuTreeVO> children;
}