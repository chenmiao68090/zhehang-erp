package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 刻章·外区域合作(浙江省内、杭州以外的备案/刻章合作商名录)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_out_region")
public class BizOutRegion extends BaseEntity {
    /** 城市 */
    private String city;
    /** 对接群 */
    private String contactGroup;
    /** 外区域对接人 */
    private String contactPerson;
    /** 联系方式 */
    private String contactPhone;
    /** 仅备案单价 */
    private BigDecimal recordOnlyPrice;
    /** 备案+刻章(文本,如"35"或"不备案") */
    private String recordEngrave;
    /** 法人章备案情况(默认) */
    private String legalSealRecord;
    /** 半身照是否需要(文本) */
    private String needHalfPhoto;
    /** 公章默认尺寸(如 42*42) */
    private String publicSealSize;
    /** 合作商收款码(文本/URL) */
    private String payQrcode;
    /** 杭州仅备案单价 */
    private BigDecimal hzRecordPrice;
    /** 杭州仅登报(文本) */
    private String hzReportOnly;
    /** 备注 */
    private String remark;
}
