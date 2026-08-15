package com.zhehang.erp.modules.task.domain.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HandoverCreateDTO {

    @NotNull(message = "关联合同不能为空")
    private Long contractId;

    @NotNull(message = "接收人不能为空")
    private Long accountantId;

    @NotNull(message = "交接截止日不能为空")
    private LocalDate deadline;

    @Size(max = 2000, message = "交接说明不能超过2000字")
    private String note;
}
