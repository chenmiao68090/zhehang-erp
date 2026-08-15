package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 离职交接台账(飞书建议 160「离职人员」离职交接 SOP)。
 * 员工数据仍走既有只读 /org/employee/list(status=3),本表只登记离职交接的
 * SOP 附件与交接事项,不改 org_employee。一名员工可有多条交接记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_resign_handover")
public class HrmResignHandover extends BaseEntity {
    /** 离职员工ID(org_employee.id) */
    private Long employeeId;
    /** 离职员工姓名 */
    private String employeeName;
    /** 交接日期 */
    private LocalDate handoverDate;
    /** 交接人姓名快照(由服务端按稳定员工ID派生) */
    private String handoverTo;
    /** 稳定接收人员工ID(org_employee.id) */
    private Long handoverToEmployeeId;
    /** 交接SOP附件(file_info.id) */
    @TableField(updateStrategy = FieldStrategy.ALWAYS)
    private Long sopFileId;
    /** 前端明确要求清除旧SOP引用；不落库。 */
    @TableField(exist = false)
    private Boolean clearSopFile;
    /** 交接事项(文本) */
    private String items;
    /** 客户交接:0待确认/1处理中/2已完成/3异常 */
    private Integer customerCheckStatus;
    /** 任务交接:0待确认/1处理中/2已完成/3异常 */
    private Integer taskCheckStatus;
    /** 资料交接:0待确认/1处理中/2已完成/3异常 */
    private Integer documentCheckStatus;
    /** 资产交接:0待确认/1处理中/2已完成/3异常 */
    private Integer assetCheckStatus;
    /** 结算交接:0待确认/1处理中/2已完成/3异常 */
    private Integer settlementCheckStatus;
    /** 状态:0待交接/1交接中/2已完成 */
    private Integer status;
    /** 五项完成且账号已停用/未开通后的归档时间 */
    private LocalDateTime archiveTime;
    /** 乐观锁版本，防止陈旧请求把已闭环记录重新打开。 */
    @Version
    private Integer recordVersion;
    /** 备注 */
    private String remark;
}
