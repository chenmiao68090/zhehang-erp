package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizWechatFriendInfo;
import com.zhehang.erp.modules.crm.domain.vo.WechatFriendVO;
import com.zhehang.erp.modules.crm.mapper.BizWechatFriendInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 云客主动同步好友查询,给前端「微信好友」页使用(需登录)。
 * 数据来自 getAllFriendsIncrement 主动拉取写入的 biz_wechat_friend_info；
 * 匿名回调及其旧表不再作为页面数据源。
 */
@RestController
@RequestMapping("/crm/wechat-friend")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "微信好友资料包含手机号和私人沟通元数据")
public class WechatFriendController {

    private final BizWechatFriendInfoMapper friendInfoMapper;

    @GetMapping("/list")
    public R<IPage<WechatFriendVO>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "20") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String wxId) {
        Long tenantId = requireTenantId();
        LambdaQueryWrapper<BizWechatFriendInfo> qw = new LambdaQueryWrapper<BizWechatFriendInfo>()
                .eq(BizWechatFriendInfo::getTenantId, tenantId)
                .eq(BizWechatFriendInfo::getFriendType, 1)
                .and(StringUtils.hasText(keyword), w -> w.like(BizWechatFriendInfo::getNickname, keyword)
                        .or().like(BizWechatFriendInfo::getRemark, keyword)
                        .or().like(BizWechatFriendInfo::getPhone, keyword)
                        .or().like(BizWechatFriendInfo::getAlias, keyword))
                .eq(StringUtils.hasText(wxId), BizWechatFriendInfo::getSalesWechatId, wxId)
                .orderByDesc(BizWechatFriendInfo::getUpdateTime);
        IPage<BizWechatFriendInfo> sourcePage = friendInfoMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        return R.ok(sourcePage.convert(WechatFriendController::toView));
    }

    /** 统计:好友总数 + 员工(微信)数;并返回各员工微信ID供筛选 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        Long tenantId = requireTenantId();
        List<BizWechatFriendInfo> all = friendInfoMapper.selectList(
                new LambdaQueryWrapper<BizWechatFriendInfo>()
                        .eq(BizWechatFriendInfo::getTenantId, tenantId)
                        .eq(BizWechatFriendInfo::getFriendType, 1));
        List<String> staffWx = all.stream().map(BizWechatFriendInfo::getSalesWechatId)
                .filter(StringUtils::hasText).distinct().collect(Collectors.toList());
        Map<String, Object> m = new HashMap<>();
        m.put("total", all.size());
        m.put("staffCount", staffWx.size());
        m.put("staffWxIds", staffWx);
        return R.ok(m);
    }

    private static Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文，禁止查询微信好友数据");
        }
        return tenantId;
    }

    private static WechatFriendVO toView(BizWechatFriendInfo source) {
        WechatFriendVO target = new WechatFriendVO();
        target.setId(source.getId());
        target.setWxId(source.getSalesWechatId());
        target.setFriendWxId(source.getFriendWxId());
        target.setFriendNickname(source.getNickname());
        target.setFriendRemark(source.getRemark());
        target.setFriendAlias(source.getAlias());
        target.setGender(source.getGender());
        target.setRegion(source.getRegion());
        target.setFriendWxPhone(source.getPhone());
        target.setFromType("云客主动同步");
        target.setHeadUrl(source.getHeadUrl());
        target.setLastChatTime(source.getLastChatTime());
        target.setUpdateTime(source.getUpdateTime());
        return target;
    }
}
