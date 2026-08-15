package com.zhehang.erp.modules.org.domain.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Data;

import java.time.LocalDate;

/** 办理员工离职：离职日期是档案和离职台账共用的真实生效日。 */
@Data
public class EmployeeResignDTO {

    @NotNull(message = "离职日期不能为空")
    @PastOrPresent(message = "暂不支持预约未来离职")
    private LocalDate resignDate;
}
