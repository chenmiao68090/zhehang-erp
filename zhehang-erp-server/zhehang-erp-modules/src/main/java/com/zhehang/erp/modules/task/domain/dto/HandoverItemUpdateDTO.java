package com.zhehang.erp.modules.task.domain.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HandoverItemUpdateDTO {

    @NotNull(message = "交接项ID不能为空")
    private Long itemId;

    private String salesStatus;

    @Size(max = 500, message = "文件地址不能超过500字")
    private String fileUrl;

    private LocalDate supplyExpectedDate;

    private String accountantStatus;

    @Size(max = 200, message = "退回原因不能超过200字")
    private String rejectReason;
}
