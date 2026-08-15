package com.zhehang.erp.modules.crm.domain.vo;

import com.zhehang.erp.modules.crm.domain.dto.CrmLeadImportRowDTO;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/** 单行预检/确认结果；既有记录只返回当前操作者可安全定位的最小信息。 */
@Data
public class CrmLeadImportRowVO {
    private Integer rowNumber;
    private String status;
    private List<String> reasonCodes = new ArrayList<>();
    private List<String> reasons = new ArrayList<>();
    private List<String> warningCodes = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    /** 仅预检返回服务端规范化后的本次上传行；确认结果可为空。 */
    private CrmLeadImportRowDTO row;
    /** 命中的既有记录类型：LEAD/CUSTOMER。 */
    private String existingRecordType;
    /** 有权定位时返回；无权查看其他销售私海时必须为空。 */
    private Long existingRecordId;
    /** 公司公海/我的客户/部门客户/历史客资/正式客户/其他销售跟进中。 */
    private String existingLocation;
    /** 有权查看时返回负责人姓名；越权命中统一显示“其他销售”。 */
    private String existingOwnerName;
    /** 前端安全跳转目标：PUBLIC_POOL/ACTIVE/HISTORY/CUSTOMER/NONE。 */
    private String existingTarget;
}
