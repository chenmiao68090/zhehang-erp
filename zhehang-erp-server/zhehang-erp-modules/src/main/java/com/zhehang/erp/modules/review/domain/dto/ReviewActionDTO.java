package com.zhehang.erp.modules.review.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class ReviewActionDTO {
    private ReviewActionDTO() {
    }

    @Data
    public static class AssignHandler {
        @NotNull
        private Long handlerUserId;
        @NotNull
        private LocalDateTime deadline;
        @Size(max = 500)
        private String remark;
    }

    @Data
    public static class Accept {
        @NotNull
        private Boolean materialsReady;
        private LocalDateTime expectedCompleteTime;
        @Size(max = 500)
        private String remark;
    }

    @Data
    public static class SubmitComplete {
        @NotBlank
        @Size(max = 1000)
        private String resultDesc;
        @Valid
        @NotEmpty
        @Size(max = 10)
        private List<AttachmentRef> attachments = new ArrayList<>();
        @Size(max = 500)
        private String remark;
    }

    @Data
    public static class ConfirmComplete {
        @NotNull
        private Boolean pass;
        @Size(max = 500)
        private String opinion;
    }

    /** 合同审理/到款确认通用入参(提单类审核单的真人节点)。 */
    @Data
    public static class NodeReview {
        @NotNull
        private Boolean pass;
        @Size(max = 500)
        private String opinion;
    }

    @Data
    public static class AttachmentRef {
        @NotNull
        private Long id;
        @NotBlank
        @Size(max = 255)
        private String name;
        @Size(max = 100)
        private String mimeType;
        private Long size;
    }
}
