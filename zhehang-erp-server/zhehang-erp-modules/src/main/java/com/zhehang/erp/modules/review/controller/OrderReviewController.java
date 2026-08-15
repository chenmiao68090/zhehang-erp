package com.zhehang.erp.modules.review.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.review.domain.dto.ReviewActionDTO;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import com.zhehang.erp.modules.review.domain.vo.OrderReviewDetailVO;
import com.zhehang.erp.modules.review.service.OrderReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/order/review")
@RequiredArgsConstructor
public class OrderReviewController {
    private final OrderReviewService reviewService;

    @GetMapping("/list")
    public R<IPage<OrderReview>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return R.ok(reviewService.list(pageNum, pageSize, status, keyword));
    }

    @GetMapping("/stats")
    public R<Map<String, Long>> stats() {
        return R.ok(reviewService.stats());
    }

    /** 合同审理(部门主管):提单类审核单的第一个真人节点。 */
    @PostMapping("/{id}/contract/review")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> contractReview(@PathVariable Long id,
                                  @Valid @RequestBody ReviewActionDTO.NodeReview request) {
        reviewService.contractReview(id, request);
        return R.ok();
    }

    /** 到款确认(财务):提单类审核单的第二个真人节点。 */
    @PostMapping("/{id}/payment/review")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> paymentReview(@PathVariable Long id,
                                 @Valid @RequestBody ReviewActionDTO.NodeReview request) {
        reviewService.paymentReview(id, request);
        return R.ok();
    }

    @GetMapping("/{id}")
    public R<OrderReviewDetailVO> detail(@PathVariable Long id) {
        return R.ok(reviewService.detail(id));
    }

    @GetMapping("/{id}/attachments/{fileId}")
    @Log(module = "审单凭证", type = Log.OperationType.QUERY)
    @DenyDuringImpersonation(reason = "员工视角禁止下载审单凭证")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id,
                                                       @PathVariable Long fileId) {
        Map<String, Object> result = reviewService.downloadAttachment(id, fileId);
        Object path = result.get("filePath");
        if (!(path instanceof String filePath) || filePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        File file = new File(filePath);
        if (!file.isFile()) {
            return ResponseEntity.notFound().build();
        }
        String fileName = String.valueOf(result.getOrDefault("fileName", "attachment"));
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replace("+", "%20");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedName)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new FileSystemResource(file));
    }

    @PostMapping("/{id}/assign-handler")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> assignHandler(@PathVariable Long id,
                                 @Valid @RequestBody ReviewActionDTO.AssignHandler request) {
        reviewService.assignHandler(id, request);
        return R.ok();
    }

    @PostMapping("/{id}/accept")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> accept(@PathVariable Long id,
                          @Valid @RequestBody ReviewActionDTO.Accept request) {
        reviewService.accept(id, request);
        return R.ok();
    }

    @PostMapping("/{id}/complete/submit")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> submitComplete(@PathVariable Long id,
                                  @Valid @RequestBody ReviewActionDTO.SubmitComplete request) {
        reviewService.submitComplete(id, request);
        return R.ok();
    }

    @PostMapping("/{id}/complete/confirm")
    @Log(module = "审单中心", type = Log.OperationType.UPDATE)
    public R<Void> confirmComplete(@PathVariable Long id,
                                   @Valid @RequestBody ReviewActionDTO.ConfirmComplete request) {
        reviewService.confirmComplete(id, request);
        return R.ok();
    }
}
