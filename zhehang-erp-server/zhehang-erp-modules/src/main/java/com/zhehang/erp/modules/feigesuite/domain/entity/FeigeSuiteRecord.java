package com.zhehang.erp.modules.feigesuite.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 飞哥业务中心的隔离记录载体。
 *
 * <p>稳定且需要检索/鉴权的字段独立成列，页面差异字段保存在 dataJson。
 * 该表不替代浙杭既有业务事实表，也不会与原财务、人事、培训数据互写。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_suite_record")
public class FeigeSuiteRecord extends BaseEntity {
    private String pageCode;
    private String recordNo;
    private String title;
    private String categoryCode;
    private String status;
    private Long ownerId;
    private String ownerName;
    private Long deptId;
    private String deptName;
    private BigDecimal amount;
    private LocalDate bizDate;
    private LocalDate dueDate;
    private String source;
    private Integer sortNo;
    private String searchText;
    private String dataJson;

    @Version
    private Integer version;
}
