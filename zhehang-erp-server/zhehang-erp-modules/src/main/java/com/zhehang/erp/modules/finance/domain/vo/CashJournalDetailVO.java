package com.zhehang.erp.modules.finance.domain.vo;

import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionCase;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionEvent;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournalEvent;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatch;
import lombok.Data;

import java.util.List;

/** 右侧记录详情：到账事实、核销、异常和不可覆盖时间线一次返回。 */
@Data
public class CashJournalDetailVO {
    private FinCashJournal journal;
    private List<FinCashMatch> matches;
    private FinCashExceptionCase exceptionCase;
    private List<FinCashExceptionEvent> exceptionEvents;
    private List<FinCashJournalEvent> journalEvents;
    private Boolean dailyClosed;
}
