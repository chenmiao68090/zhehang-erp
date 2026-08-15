package com.zhehang.erp.modules.channel.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.channel.domain.BizChannelPartner;
import com.zhehang.erp.modules.channel.mapper.BizChannelPartnerMapper;
import com.zhehang.erp.modules.channel.service.IBizChannelPartnerService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 同行渠道 Service 实现。含协议价/账期/应收等敏感信息,按创建人收敛数据范围(同 biz_supplier 口径)。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BizChannelPartnerServiceImpl implements IBizChannelPartnerService {

    private final BizChannelPartnerMapper partnerMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public IPage<BizChannelPartner> partnerList(int pageNum, int pageSize,
                                                String keyword, String partnerType,
                                                String partnerLevel, String status) {
        LambdaQueryWrapper<BizChannelPartner> wrapper = new LambdaQueryWrapper<>();
        // 同行渠道含协议价/账期/应收等敏感信息,按创建人收敛(与 biz_supplier 一致)
        dataScopeHelper.applyCreatorScope(wrapper, BizChannelPartner::getCreateBy);
        wrapper.and(StringUtils.hasText(keyword), w -> w
                        .like(BizChannelPartner::getName, keyword)
                        .or().like(BizChannelPartner::getContactName, keyword)
                        .or().like(BizChannelPartner::getContactPhone, keyword))
                .eq(StringUtils.hasText(partnerType), BizChannelPartner::getPartnerType, partnerType)
                .eq(StringUtils.hasText(partnerLevel), BizChannelPartner::getPartnerLevel, partnerLevel)
                .eq(StringUtils.hasText(status), BizChannelPartner::getStatus, status)
                .orderByDesc(BizChannelPartner::getCreateTime);
        return partnerMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public BizChannelPartner getPartner(Long id) {
        BizChannelPartner partner = partnerMapper.selectById(id);
        if (partner == null) {
            throw new BusinessException("同行渠道不存在");
        }
        // 越权校验:按现有记录真实创建人判定(走 data_scope=1 含老板),非本人/非授权拒绝
        if (!dataScopeHelper.canAccess(partner.getCreateBy(), null)) {
            throw new BusinessException("无权查看他人记录");
        }
        return partner;
    }

    @Override
    public Long savePartner(BizChannelPartner partner) {
        if (partner.getId() == null) {
            if (!StringUtils.hasText(partner.getPartnerNo())) {
                partner.setPartnerNo("CH" + System.currentTimeMillis());
            }
            if (!StringUtils.hasText(partner.getStatus())) {
                partner.setStatus("active");
            }
            partnerMapper.insert(partner);
        } else {
            // 越权校验:按现有记录真实创建人判定(别信前端传值),非本人/非授权拒绝
            BizChannelPartner existing = partnerMapper.selectById(partner.getId());
            if (existing == null) {
                throw new BusinessException("同行渠道不存在");
            }
            if (!dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
                throw new BusinessException("无权修改他人记录");
            }
            partnerMapper.updateById(partner);
        }
        return partner.getId();
    }

    @Override
    public void removePartner(Long id) {
        BizChannelPartner partner = partnerMapper.selectById(id);
        if (partner == null) {
            throw new BusinessException("同行渠道不存在");
        }
        // 越权校验:按现有记录真实创建人判定(走 data_scope=1 含老板),非本人/非授权拒绝
        if (!dataScopeHelper.canAccess(partner.getCreateBy(), null)) {
            throw new BusinessException("无权删除他人记录");
        }
        partnerMapper.deleteById(id);
    }

    @Override
    public void changeStatus(Long id, String status) {
        BizChannelPartner partner = partnerMapper.selectById(id);
        if (partner == null) {
            throw new BusinessException("同行渠道不存在");
        }
        // 越权校验:按现有记录真实创建人判定(走 data_scope=1 含老板),非本人/非授权拒绝
        if (!dataScopeHelper.canAccess(partner.getCreateBy(), null)) {
            throw new BusinessException("无权操作他人记录");
        }
        partner.setStatus(status);
        partnerMapper.updateById(partner);
    }
}
