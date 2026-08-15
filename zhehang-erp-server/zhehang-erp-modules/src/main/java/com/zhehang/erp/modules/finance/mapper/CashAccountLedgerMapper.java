package com.zhehang.erp.modules.finance.mapper;

import com.zhehang.erp.modules.finance.domain.vo.CashAccountLedgerVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface CashAccountLedgerMapper {
    BigDecimal sumReceipts(@Param("tenantId") Long tenantId,
                           @Param("accountId") Long accountId,
                           @Param("accountName") String accountName,
                           @Param("dateStart") LocalDate dateStart,
                           @Param("dateEnd") LocalDate dateEnd);

    BigDecimal sumAdjustments(@Param("tenantId") Long tenantId,
                              @Param("accountId") Long accountId,
                              @Param("dateStart") LocalDate dateStart,
                              @Param("dateEnd") LocalDate dateEnd);

    long countLedger(@Param("tenantId") Long tenantId,
                     @Param("accountId") Long accountId,
                     @Param("accountName") String accountName,
                     @Param("dateStart") LocalDate dateStart,
                     @Param("dateEnd") LocalDate dateEnd);

    List<CashAccountLedgerVO> selectLedger(@Param("tenantId") Long tenantId,
                                           @Param("accountId") Long accountId,
                                           @Param("accountName") String accountName,
                                           @Param("dateStart") LocalDate dateStart,
                                           @Param("dateEnd") LocalDate dateEnd,
                                           @Param("offset") long offset,
                                           @Param("pageSize") long pageSize);
}
