package com.zhehang.erp.modules.culture.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 人文中心可维护内容（行政制度 / 企业文化 / 员工风采荣誉）。
 *
 * <p>把原先写死在前端 culture/index.vue 里的「行政制度」「企业文化」从硬编码改为后端可维护：
 * 管理员通过 /culture/content 增删改，前端按 type 拉取渲染。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("culture_content")
public class CultureContent extends BaseEntity {
    /** 类型：policy 行政制度 / culture 企业文化 / honor 员工风采荣誉 */
    private String type;
    /** 标题 */
    private String title;
    /** 内容（长文本，可存富文本或多行说明） */
    private String content;
    /** 图标（emoji 或图标名） */
    private String icon;
    /** 排序号（升序） */
    private Integer sortOrder;
    /** 状态：1 启用 / 0 停用 */
    private Integer status;
}
