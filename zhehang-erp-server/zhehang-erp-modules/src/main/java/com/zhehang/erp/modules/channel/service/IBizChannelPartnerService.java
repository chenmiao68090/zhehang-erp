package com.zhehang.erp.modules.channel.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.channel.domain.BizChannelPartner;

/**
 * 同行渠道 Service(独立 Service,不并入聚合的 IBizChannelService,避免改动三页共用类)
 */
public interface IBizChannelPartnerService {

    /** 同行渠道分页(支持名称/类型/等级/状态过滤) */
    IPage<BizChannelPartner> partnerList(int pageNum, int pageSize,
                                         String keyword, String partnerType,
                                         String partnerLevel, String status);

    /** 查询详情(按创建人越权校验,非本人/非授权拒绝) */
    BizChannelPartner getPartner(Long id);

    /** 保存(新增/更新二合一,id==null 走 insert 否则 updateById) */
    Long savePartner(BizChannelPartner partner);

    /** 删除 */
    void removePartner(Long id);

    /** 状态切换(暂停/恢复) */
    void changeStatus(Long id, String status);
}
