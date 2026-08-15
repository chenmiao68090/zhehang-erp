package com.zhehang.erp.modules.crm.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 电销通话记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_call_record")
public class BizCallRecord extends BaseEntity {
    /** 关联线索ID(crm_lead.id) */
    private Long leadId;
    /** 客户/公司名称 */
    private String customerName;
    /** 被叫号码 */
    private String phone;
    /** 坐席(拨打人)用户ID */
    private Long agentId;
    /** 坐席姓名 */
    private String agentName;
    /** 拨打方式(manual手动/auto自动/platform平台) */
    private String callType;
    /** 拨打时间 */
    private LocalDateTime callTime;
    /** 通话时长(秒) */
    private Integer duration;
    /** 是否接通(0未接/1接通) */
    private Integer connected;
    /** 通话结果(接通/未接/占线/空号/拒接等) */
    private String result;
    /** 录音文件地址(平台回传) */
    @JsonIgnore
    private String recordUrl;
    /** 仅供接口返回是否存在录音，原始地址永不序列化到前端。 */
    @TableField(exist = false)
    private Boolean recordingAvailable;
    /** 外呼平台通话ID */
    private String platformCallId;
    /** 通话小结/备注 */
    private String remark;
    /** 本通意向分类(A/B/C/D/E) */
    private String intentLevel;
    /** 本通客户需求类型(多选逗号分隔) */
    private String needType;
    /** 本通报价情况(未报价/已报价/已成交) */
    private String quoteStatus;
}
