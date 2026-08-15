package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizWechatChat;
import com.zhehang.erp.modules.crm.domain.BizWechatFriendInfo;
import com.zhehang.erp.modules.crm.domain.BizWechatMsgStat;
import com.zhehang.erp.modules.crm.domain.BizYunkeUserMap;
import com.zhehang.erp.modules.crm.domain.YunkeConfig;
import com.zhehang.erp.modules.crm.integration.YunkeClient;
import com.zhehang.erp.modules.crm.mapper.BizWechatChatMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatFriendInfoMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatMsgStatMapper;
import com.zhehang.erp.modules.crm.mapper.BizYunkeUserMapMapper;
import com.zhehang.erp.modules.crm.mapper.YunkeConfigMapper;
import com.zhehang.erp.modules.crm.service.CallRecordingService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 云客集成:凭证配置(读写)+ 测试连接。
 * 签名KEY 读取时脱敏,保存时若提交的是脱敏值则保留库中原KEY。
 */
@Slf4j
@RestController
@RequestMapping("/crm/yunke")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "云客配置与聊天数据包含密钥及私人沟通信息")
public class YunkeController {

    private final YunkeConfigMapper configMapper;
    private final YunkeClient yunkeClient;
    private final ObjectMapper objectMapper;
    private final BizWechatChatMapper chatMapper;
    private final BizYunkeUserMapMapper mapMapper;
    private final SysUserMapper sysUserMapper;
    private final BizWechatFriendInfoMapper friendInfoMapper;
    private final BizWechatMsgStatMapper msgStatMapper;
    private final OrgEmployeeMapper orgEmployeeMapper;
    private final DataScopeHelper dataScopeHelper;
    private final CallRecordingService callRecordingService;

    private static final String MASK = "********";

    /** 读配置(signKey 脱敏) */
    @GetMapping("/config")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<YunkeConfig> getConfig() {
        Long tenantId = requireTenantId();
        YunkeConfig c = configMapper.selectOne(new LambdaQueryWrapper<YunkeConfig>()
                .eq(YunkeConfig::getTenantId, tenantId)
                .last("limit 1"));
        if (c == null) {
            c = new YunkeConfig();
            c.setTenantId(tenantId);
            c.setBaseUrl("https://phone.yunkecn.com");
            c.setEnabled(1);
        }
        if (StringUtils.hasText(c.getSignKey())) {
            c.setSignKey(MASK);
        }
        return R.ok(c);
    }

    /** 保存配置。提交的 signKey 为脱敏/空时,保留库中原值(便于只改其他字段) */
    @PostMapping("/config")
    @Log(module = "云客集成", type = Log.OperationType.UPDATE)
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<Void> saveConfig(@RequestBody YunkeConfig in) {
        Long tenantId = requireTenantId();
        YunkeConfig ex = configMapper.selectOne(new LambdaQueryWrapper<YunkeConfig>()
                .eq(YunkeConfig::getTenantId, tenantId)
                .last("limit 1"));
        if (in.getSignKey() == null || in.getSignKey().isBlank() || in.getSignKey().contains("*")) {
            in.setSignKey(ex != null ? ex.getSignKey() : null);
        }
        if (!StringUtils.hasText(in.getBaseUrl())) {
            in.setBaseUrl("https://phone.yunkecn.com");
        }
        if (in.getEnabled() == null) {
            in.setEnabled(1);
        }
        in.setTenantId(tenantId);
        if (ex == null) {
            configMapper.insert(in);
        } else {
            in.setId(ex.getId());
            configMapper.updateById(in);
        }
        return R.ok();
    }

    /**
     * 测试连接:用当前凭证调云客「销售微信沟通人数统计」(只读、安全),验证凭证/签名/IP白名单是否都通。
     */
    @PostMapping("/test")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<Object> test() {
        try {
            LocalDate today = LocalDate.now();
            JsonNode r = yunkeClient.call("/open/wechat/salesWechatStatistics", Map.of(
                    "beginYmd", today.minusDays(30).toString(),
                    "endYmd", today.toString(),
                    "page", 1,
                    "size", 3));
            boolean ok = r.path("success").asBoolean(false)
                    || r.path("code").asInt(-1) == 200
                    || r.path("code").asInt(-1) == 0;
            Map<String, Object> out = new HashMap<>();
            out.put("success", ok);
            out.put("message", ok ? "连接成功" : "云客返回异常");
            return R.ok(out);
        } catch (Exception e) {
            Map<String, Object> out = new HashMap<>();
            out.put("success", false);
            log.warn("[云客] 连接测试失败 type={}", e.getClass().getSimpleName());
            out.put("message", "测试失败，请检查配置和平台状态");
            return R.ok(out);
        }
    }

    /**
     * 员工微信列表(真实数据):聚合云客多个接口拼成一张表。
     * - 基础列表(微信号/昵称/手机)← /open/wechat/companyAccounts
     * - 沟通人数(总/主动/被动)← /open/wechat/salesWechatStatistics(时间段内按微信号累加)
     * - 有效沟通数/跟进客户数 ← /open/wechat/getWeChatFollowStats(endYmd 当天;同ymd 15分钟限频1次,失败留空)
     * 说明:发送/接收消息数、好友数、群数需另拼接口(数据量大/归属难,后续补);撤回/回复率/未回复
     *      云客开放API不提供,前端标注"—"。
     */
    @GetMapping("/wechat-staff-list")
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> wechatStaffList(@RequestParam(required = false) String beginYmd,
                                                  @RequestParam(required = false) String endYmd) {
        try {
            LocalDate end = StringUtils.hasText(endYmd) ? LocalDate.parse(endYmd) : LocalDate.now();
            LocalDate begin = StringUtils.hasText(beginYmd) ? LocalDate.parse(beginYmd) : end.minusDays(6);

            // 1) 基础列表:公司所有微信账号(一个员工微信一行)
            Map<String, Map<String, Object>> byWx = new LinkedHashMap<>();
            Map<String, String> staffMap = buildPhoneNameMap(); // 工作手机→实际使用人姓名
            JsonNode acc = yunkeClient.call("/open/wechat/companyAccounts",
                    Map.of("pageIndex", 1, "pageSize", 400));
            for (JsonNode emp : acc.path("data").path("page")) {
                String userPhone = emp.path("userPhone").asText("");
                for (JsonNode w : emp.path("data")) {
                    String wxId = w.path("wechatId").asText("");
                    if (wxId.isEmpty()) continue;
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("wechatId", wxId);
                    row.put("nickname", w.path("nickname").asText(""));
                    row.put("alias", w.path("alias").asText(""));
                    String wp = w.path("phone").asText("");
                    row.put("phone", wp.isEmpty() ? userPhone : wp);
                    row.put("userPhone", userPhone);
                    row.put("staffName", staffMap.getOrDefault(userPhone, "")); // 实际使用人
                    row.put("headUrl", w.path("headUrl").asText(""));
                    row.put("talkCount", 0);
                    row.put("sendTalker", 0);
                    row.put("receiveTalker", 0);
                    row.put("contactCount", 0);
                    row.put("followCount", 0);
                    byWx.put(wxId, row);
                }
            }

            // 2) 沟通人数(时间段,分页累加到微信号)
            try {
                int p = 1;
                while (p <= 30) {
                    JsonNode st = yunkeClient.call("/open/wechat/salesWechatStatistics",
                            Map.of("beginYmd", begin.toString(), "endYmd", end.toString(), "page", p, "size", 200));
                    JsonNode arr = st.path("data").path("data");
                    for (JsonNode d : arr) {
                        Map<String, Object> row = byWx.get(d.path("wechatId").asText(""));
                        if (row == null) continue;
                        row.put("talkCount", (Integer) row.get("talkCount") + d.path("countNum").asInt(0));
                        row.put("sendTalker", (Integer) row.get("sendTalker") + d.path("sendTalkerCount").asInt(0));
                        row.put("receiveTalker", (Integer) row.get("receiveTalker") + d.path("receiveTalkerCount").asInt(0));
                    }
                    int totalPages = st.path("data").path("totalPages").asInt(1);
                    if (arr.size() == 0 || p >= totalPages) break;
                    p++;
                }
            } catch (Exception e) {
                logIntegrationFailure("沟通人数拉取", e);
            }

            // 3) 有效沟通/跟进(endYmd 当天;15分钟限频,失败则留空不报错)
            try {
                JsonNode fs = yunkeClient.call("/open/wechat/getWeChatFollowStats",
                        Map.of("ymd", end.toString()));
                for (JsonNode d : fs.path("data")) {
                    Map<String, Object> row = byWx.get(d.path("wxId").asText(""));
                    if (row == null) continue;
                    row.put("contactCount", d.path("contactCount").asInt(0));
                    row.put("followCount", d.path("followCount").asInt(0));
                }
            } catch (Exception e) {
                logIntegrationFailure("有效跟进拉取", e);
            }

            // 群数+聊天数:从已同步聊天记录统计(群数=distinct roomid;聊天数=总消息数,前端据此标记谁有聊天)
            try {
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<BizWechatChat> gw =
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                gw.select("wechat_id", "COUNT(*) AS cc",
                                "COUNT(DISTINCT CASE WHEN roomid IS NOT NULL AND roomid<>'' THEN roomid END) AS gc")
                        .eq("tenant_id", requireTenantId())
                        .groupBy("wechat_id");
                for (Map<String, Object> g : chatMapper.selectMaps(gw)) {
                    Map<String, Object> row = byWx.get(String.valueOf(g.get("wechat_id")));
                    if (row != null) {
                        row.put("chatCount", g.get("cc") != null ? ((Number) g.get("cc")).intValue() : 0);
                        row.put("groupCount", g.get("gc") != null ? ((Number) g.get("gc")).intValue() : 0);
                    }
                }
            } catch (Exception e) {
                logIntegrationFailure("群数/聊天数统计", e);
            }

            // 好友数:从好友信息表按员工微信统计(friend_type=1 好友)
            try {
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<BizWechatFriendInfo> fw =
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                fw.select("sales_wechat_id", "COUNT(*) AS fc")
                        .eq("tenant_id", requireTenantId())
                        .eq("friend_type", 1)
                        .groupBy("sales_wechat_id");
                for (Map<String, Object> f : friendInfoMapper.selectMaps(fw)) {
                    Map<String, Object> row = byWx.get(String.valueOf(f.get("sales_wechat_id")));
                    if (row != null && f.get("fc") != null) row.put("friendCount", ((Number) f.get("fc")).intValue());
                }
            } catch (Exception e) {
                logIntegrationFailure("好友数统计", e);
            }

            // 消息数:从消息统计表按微信号 sum(时间段内 send/recv 条数)
            try {
                com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<BizWechatMsgStat> mw =
                        new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
                mw.select("wechat_id", "COALESCE(SUM(send_count),0) AS s", "COALESCE(SUM(recv_count),0) AS r")
                        .eq("tenant_id", requireTenantId())
                        .ge("ymd", begin.toString()).le("ymd", end.toString())
                        .groupBy("wechat_id");
                for (Map<String, Object> m : msgStatMapper.selectMaps(mw)) {
                    Map<String, Object> row = byWx.get(String.valueOf(m.get("wechat_id")));
                    if (row == null) continue;
                    if (m.get("s") != null) row.put("sendMsg", ((Number) m.get("s")).intValue());
                    if (m.get("r") != null) row.put("recvMsg", ((Number) m.get("r")).intValue());
                }
            } catch (Exception e) {
                logIntegrationFailure("消息数统计", e);
            }

            Map<String, Object> out = new HashMap<>();
            Set<String> visibleWechatIds = visibleWechatIds();
            if (visibleWechatIds != null) {
                byWx.entrySet().removeIf(entry -> !visibleWechatIds.contains(entry.getKey()));
            }
            out.put("list", new ArrayList<>(byWx.values()));
            out.put("beginYmd", begin.toString());
            out.put("endYmd", end.toString());
            out.put("total", byWx.size());
            return R.ok(out);
        } catch (Exception e) {
            return integrationFailure("拉取员工微信列表", e);
        }
    }

    /**
     * 微信聊天记录:点头像看某员工微信的聊天。
     * - 不传 talker:返回该员工的会话列表(按好友/群分组,每组最新一条+条数,按最新时间倒序)。
     * - 传 talker:返回该会话的消息(时间正序,最多300条)。
     * 数据来自 biz_wechat_chat(后台 YunkeChatSyncJob 从云客同步)。
     */
    @GetMapping("/wechat-chat")
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> wechatChat(@RequestParam String wechatId,
                                             @RequestParam(required = false) String talker,
                                             @RequestParam(required = false) String roomid,
                                             @RequestParam(required = false) String keyword,
                                             @RequestParam(required = false) Integer msgType,
                                             @RequestParam(required = false) String beginYmd,
                                             @RequestParam(required = false) String endYmd) {
        assertOwnWechat(wechatId);
        Map<String, Object> out = new HashMap<>();
        boolean kw = StringUtils.hasText(keyword), gb = StringUtils.hasText(beginYmd), he = StringUtils.hasText(endYmd);
        if (StringUtils.hasText(roomid)) {
            // 群会话:按 roomid 查(群里所有人的消息,时间正序)
            List<BizWechatChat> msgs = chatMapper.selectList(new LambdaQueryWrapper<BizWechatChat>()
                    .eq(BizWechatChat::getTenantId, requireTenantId())
                    .eq(BizWechatChat::getWechatId, wechatId)
                    .eq(BizWechatChat::getRoomid, roomid)
                    .like(kw, BizWechatChat::getContent, keyword)
                    .eq(msgType != null, BizWechatChat::getMsgType, msgType)
                    .ge(gb, BizWechatChat::getMsgTime, beginYmd + " 00:00:00")
                    .le(he, BizWechatChat::getMsgTime, endYmd + " 23:59:59")
                    .orderByAsc(BizWechatChat::getMsgTime)
                    .last("limit 800"));
            out.put("messages", msgs);
        } else if (StringUtils.hasText(talker)) {
            // 单聊:按 talker 查(排除群消息)
            List<BizWechatChat> msgs = chatMapper.selectList(new LambdaQueryWrapper<BizWechatChat>()
                    .eq(BizWechatChat::getTenantId, requireTenantId())
                    .eq(BizWechatChat::getWechatId, wechatId)
                    .eq(BizWechatChat::getTalker, talker)
                    .and(w -> w.isNull(BizWechatChat::getRoomid).or().eq(BizWechatChat::getRoomid, ""))
                    .like(kw, BizWechatChat::getContent, keyword)
                    .eq(msgType != null, BizWechatChat::getMsgType, msgType)
                    .ge(gb, BizWechatChat::getMsgTime, beginYmd + " 00:00:00")
                    .le(he, BizWechatChat::getMsgTime, endYmd + " 23:59:59")
                    .orderByAsc(BizWechatChat::getMsgTime)
                    .last("limit 800"));
            out.put("messages", msgs);
        } else {
            List<BizWechatChat> all = chatMapper.selectList(new LambdaQueryWrapper<BizWechatChat>()
                    .eq(BizWechatChat::getTenantId, requireTenantId())
                    .eq(BizWechatChat::getWechatId, wechatId)
                    .orderByDesc(BizWechatChat::getMsgTime)
                    .last("limit 3000"));
            LinkedHashMap<String, Map<String, Object>> sessions = new LinkedHashMap<>();
            for (BizWechatChat c : all) {
                // 群聊按 roomid 聚合(否则我发/别人发被拆成两个会话),单聊按 talker
                boolean isRoom = StringUtils.hasText(c.getRoomid());
                String key = isRoom ? c.getRoomid() : (c.getTalker() == null ? "" : c.getTalker());
                Map<String, Object> s = sessions.get(key);
                if (s == null) {
                    s = new HashMap<>();
                    s.put("talker", key);
                    s.put("roomid", isRoom ? c.getRoomid() : null);
                    s.put("isRoom", isRoom);
                    s.put("lastType", c.getMsgType());
                    s.put("lastContent", c.getContent());
                    s.put("lastTime", c.getMsgTime());
                    s.put("count", 0);
                    sessions.put(key, s);
                }
                s.put("count", (Integer) s.get("count") + 1);
            }
            // 关联好友信息:talker → 真实昵称/头像(优先当前员工自己的好友记录)
            if (!sessions.isEmpty()) {
                List<BizWechatFriendInfo> infos = friendInfoMapper.selectList(new LambdaQueryWrapper<BizWechatFriendInfo>()
                        .eq(BizWechatFriendInfo::getTenantId, requireTenantId())
                        .in(BizWechatFriendInfo::getFriendWxId, sessions.keySet()));
                Map<String, BizWechatFriendInfo> dict = new HashMap<>();
                for (BizWechatFriendInfo fi : infos) {
                    if (!dict.containsKey(fi.getFriendWxId()) || wechatId.equals(fi.getSalesWechatId())) {
                        dict.put(fi.getFriendWxId(), fi);
                    }
                }
                for (Map<String, Object> s : sessions.values()) {
                    BizWechatFriendInfo fi = dict.get(String.valueOf(s.get("talker")));
                    if (fi != null) {
                        s.put("name", fi.getNickname());
                        s.put("headUrl", fi.getHeadUrl());
                        s.put("alias", fi.getAlias());
                    }
                }
            }
            out.put("sessions", new ArrayList<>(sessions.values()));
        }
        return R.ok(out);
    }

    /**
     * 云客账号列表:拉 companyAccounts,供「员工云客关联」页选择关联。
     * 返回每个云客微信账号:微信号/昵称/手机/微信id/account(内部标识)。
     */
    @GetMapping("/yunke-accounts")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<List<Map<String, Object>>> yunkeAccounts() {
        List<Map<String, Object>> list = new ArrayList<>();
        Set<String> visiblePhones = visibleSystemPhones();
        try {
            JsonNode acc = yunkeClient.call("/open/wechat/companyAccounts", Map.of("pageIndex", 1, "pageSize", 400));
            for (JsonNode emp : acc.path("data").path("page")) {
                String empPhone = emp.path("userPhone").asText("");
                for (JsonNode w : emp.path("data")) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("wechatId", w.path("wechatId").asText(""));
                    m.put("nickname", w.path("nickname").asText(""));
                    m.put("alias", w.path("alias").asText(""));
                    m.put("account", w.path("account").asText(""));
                    String p = w.path("phone").asText("");
                    String up = w.path("userPhone").asText(empPhone);
                    if (visiblePhones != null && !visiblePhones.contains(up) && !visiblePhones.contains(p)) {
                        continue;
                    }
                    m.put("phone", p.isEmpty() ? up : p);
                    m.put("userPhone", up);
                    list.add(m);
                }
            }
        } catch (Exception e) {
            return integrationFailure("拉取云客账号", e);
        }
        return R.ok(list);
    }

    /**
     * 云客成员列表(真实组织成员):调云客组织架构 deptAndUsers,递归取所有 USER 节点,
     * 返回 {name 姓名, phone 手机(工作手机,同 companyAccounts.userPhone,做关联键),
     * dept 所在部门, role 职位(major,有则给)}。
     * 供「员工云客关联」页下拉:显示"姓名(手机)·部门",value 用 phone 与现有关联保存口径一致。
     */
    @GetMapping("/yunke-members")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<List<Map<String, Object>>> yunkeMembers() {
        List<Map<String, Object>> list = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();
        try {
            JsonNode r = yunkeClient.call("/open/department/newTree/deptAndUsers", new HashMap<>());
            collectMembers(r.path("data"), "", list, seen);
            Set<String> visiblePhones = visibleSystemPhones();
            if (visiblePhones != null) {
                list.removeIf(member -> !visiblePhones.contains(String.valueOf(member.get("phone"))));
            }
        } catch (Exception e) {
            return integrationFailure("拉取云客成员", e);
        }
        return R.ok(list);
    }

    /**
     * 递归收集组织架构里的成员(USER 节点)。deptName 为当前所在部门名(顶层为空)。
     * 字段名容错:姓名 name→userName→realName→nickName;职位 major;离职(isValid=2)跳过。
     */
    private void collectMembers(JsonNode node, String deptName,
                                List<Map<String, Object>> list, java.util.Set<String> seen) {
        for (JsonNode c : node.path("sub")) {
            String t = c.path("type").asText("");
            if ("USER".equals(t)) {
                // 离职员工(USER 且 isValid=2)跳过;字段缺失则不判定、照收
                if ("2".equals(c.path("isValid").asText(""))) continue;
                String phone = c.path("phone").asText("");
                if (phone.isEmpty()) continue;
                if (!seen.add(phone)) continue; // 按手机去重
                String name = c.path("name").asText("");
                if (name.isEmpty()) name = c.path("userName").asText("");
                if (name.isEmpty()) name = c.path("realName").asText("");
                if (name.isEmpty()) name = c.path("nickName").asText("");
                Map<String, Object> m = new HashMap<>();
                m.put("name", name);
                m.put("phone", phone);   // 关联键:与 companyAccounts.userPhone / BizYunkeUserMap.yunkePhone 同口径
                m.put("dept", deptName);
                m.put("role", c.path("major").asText(""));
                m.put("userId", c.path("id").asText(""));
                list.add(m);
            } else if ("DEPT".equals(t)) {
                // 进入子部门,部门名下传(空则沿用上级,保证成员总有归属)
                String dn = c.path("name").asText("");
                collectMembers(c, dn.isEmpty() ? deptName : dn, list, seen);
            }
        }
    }

    /** 员工云客关联映射列表 */
    @GetMapping("/user-map")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<List<BizYunkeUserMap>> userMapList() {
        LambdaQueryWrapper<BizYunkeUserMap> wrapper = new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, requireTenantId());
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds != null) {
            wrapper.in(BizYunkeUserMap::getUserId, visibleUserIds);
        }
        return R.ok(mapMapper.selectList(wrapper));
    }

    /** 保存员工云客关联(批量;按 user_id upsert) */
    @PostMapping("/user-map")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    @Transactional(rollbackFor = Exception.class)
    public R<Void> saveUserMap(@RequestBody List<BizYunkeUserMap> maps) {
        if (maps == null) return R.ok();
        Long tenantId = requireTenantId();
        for (BizYunkeUserMap input : maps) {
            if (input.getUserId() == null) continue;
            if (!dataScopeHelper.canAccessOwner(input.getUserId())) {
                throw new AccessDeniedException("无权修改数据范围外员工的云客关联");
            }
            SysUser targetUser = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                    .eq(SysUser::getId, input.getUserId())
                    .eq(SysUser::getTenantId, tenantId)
                    .last("limit 1"));
            if (targetUser == null) {
                throw new AccessDeniedException("员工不属于当前租户或账号已失效");
            }
            BizYunkeUserMap ex = mapMapper.selectOne(new LambdaQueryWrapper<BizYunkeUserMap>()
                    .eq(BizYunkeUserMap::getTenantId, tenantId)
                    .eq(BizYunkeUserMap::getUserId, input.getUserId()).last("limit 1"));
            BizYunkeUserMap m = ex != null ? ex : new BizYunkeUserMap();
            m.setUserId(input.getUserId());
            m.setUserName(StringUtils.hasText(targetUser.getNickname())
                    ? targetUser.getNickname() : targetUser.getUsername());
            m.setUserPhone(targetUser.getPhone());
            m.setYunkeUserId(normalizeMappingValue(input.getYunkeUserId()));
            m.setYunkeWechatId(normalizeMappingValue(input.getYunkeWechatId()));
            m.setYunkePhone(normalizeMappingValue(input.getYunkePhone()));
            m.setYunkeNickname(normalizeMappingValue(input.getYunkeNickname()));
            m.setTenantId(tenantId);
            assertMappingIdentifierAvailable(tenantId, ex, m, "云客账号", "user");
            assertMappingIdentifierAvailable(tenantId, ex, m, "云客微信坐席", "wechat");
            assertMappingIdentifierAvailable(tenantId, ex, m, "云客绑定手机", "phone");
            if (ex == null) {
                mapMapper.insert(m);
            } else {
                mapMapper.updateById(m);
            }
        }
        return R.ok();
    }

    /**
     * 给员工开通外呼:对每个员工调云客 /open/user/phonePass(用手机号设 userId=系统员工ID),
     * 成功后存映射。以后该员工外呼就用这个 userId 作 partnerId(其云客工作手机拨号)。
     * 入参:[{userId, name, phone}]
     */
    @PostMapping("/enable-dial")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Map<String, Object>> enableDial(@RequestBody List<Map<String, Object>> employees) {
        int ok = 0, fail = 0;
        List<String> errors = new ArrayList<>();
        if (employees != null) {
            for (Map<String, Object> e : employees) {
                Object uid = e.get("userId");
                String name = String.valueOf(e.getOrDefault("name", ""));
                String phone = e.get("phone") == null ? "" : String.valueOf(e.get("phone"));
                if (uid == null || phone.isEmpty()) { fail++; continue; }
                Long employeeUserId;
                try {
                    employeeUserId = Long.valueOf(String.valueOf(uid));
                } catch (NumberFormatException ex) {
                    fail++;
                    errors.add(name + ": 员工标识无效");
                    continue;
                }
                if (!dataScopeHelper.canAccessOwner(employeeUserId)) {
                    throw new AccessDeniedException("无权开通数据范围外员工的云客外呼");
                }
                SysUser targetUser = sysUserMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getId, employeeUserId)
                        .eq(SysUser::getTenantId, requireTenantId())
                        .last("limit 1"));
                if (targetUser == null || !StringUtils.hasText(targetUser.getPhone())) {
                    fail++;
                    errors.add(name + ": 员工账号不存在或未维护手机号");
                    continue;
                }
                // 姓名/手机号只信任本租户系统账号，不信任前端可篡改字段。
                name = StringUtils.hasText(targetUser.getNickname()) ? targetUser.getNickname() : targetUser.getUsername();
                phone = targetUser.getPhone();
                String yunkeUserId = "erp" + employeeUserId;   // 系统员工ID加前缀,避免与云客已有 userId 冲突
                try {
                    JsonNode r = yunkeClient.call("/open/user/phonePass",
                            Map.of("phone", phone, "userId", yunkeUserId, "name", name));
                    if (r.path("success").asBoolean(false)) {
                        upsertMap(employeeUserId, name, phone, yunkeUserId);
                        ok++;
                    } else {
                        fail++;
                        errors.add(name + ": 平台未完成开通");
                    }
                } catch (Exception ex) {
                    fail++;
                    logIntegrationFailure("员工外呼开通", ex);
                    errors.add(name + ": 平台服务暂时不可用");
                }
            }
        }
        Map<String, Object> out = new HashMap<>();
        out.put("success", ok);
        out.put("fail", fail);
        out.put("errors", errors);
        return R.ok(out);
    }

    private void upsertMap(Long userId, String name, String phone, String yunkeUserId) {
        Long tenantId = requireTenantId();
        BizYunkeUserMap ex = mapMapper.selectOne(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, tenantId)
                .eq(BizYunkeUserMap::getUserId, userId).last("limit 1"));
        BizYunkeUserMap m = ex != null ? ex : new BizYunkeUserMap();
        m.setUserId(userId);
        m.setUserName(name);
        m.setUserPhone(phone);
        m.setYunkePhone(phone);   // 开通用的云客账号手机,下次回显预选
        m.setYunkeUserId(yunkeUserId);
        m.setTenantId(tenantId);
        assertMappingIdentifierAvailable(tenantId, ex, m, "云客账号", "user");
        assertMappingIdentifierAvailable(tenantId, ex, m, "云客绑定手机", "phone");
        if (ex != null) mapMapper.updateById(m); else mapMapper.insert(m);
    }

    private String normalizeMappingValue(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private void assertMappingIdentifierAvailable(Long tenantId, BizYunkeUserMap existing,
                                                   BizYunkeUserMap candidate, String label, String type) {
        String value = switch (type) {
            case "user" -> candidate.getYunkeUserId();
            case "wechat" -> candidate.getYunkeWechatId();
            case "phone" -> candidate.getYunkePhone();
            default -> null;
        };
        if (!StringUtils.hasText(value)) return;
        LambdaQueryWrapper<BizYunkeUserMap> wrapper = new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, tenantId);
        if (existing != null && existing.getId() != null) {
            wrapper.ne(BizYunkeUserMap::getId, existing.getId());
        }
        switch (type) {
            case "user" -> wrapper.eq(BizYunkeUserMap::getYunkeUserId, value);
            case "wechat" -> wrapper.eq(BizYunkeUserMap::getYunkeWechatId, value);
            case "phone" -> wrapper.eq(BizYunkeUserMap::getYunkePhone, value);
            default -> throw new IllegalArgumentException("未知云客映射类型");
        }
        BizYunkeUserMap conflict = mapMapper.selectOne(wrapper.last("limit 1"));
        if (conflict != null && !Objects.equals(conflict.getUserId(), candidate.getUserId())) {
            throw new BusinessException(label + "已关联其他员工，请先解除原关联");
        }
    }

    /**
     * 点击拨打:用坐席的云客 userId(partnerId)触发其工作手机拨打客户号码。
     * 入参:{phone(被叫), userId(指定坐席,可选;默认当前登录用户)}
     * 前提:该员工已开通外呼 + 工作手机登录云客工作台并在线。
     */
    @PostMapping("/dial")
    @Log(module = "云客外呼", type = Log.OperationType.OTHER)
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> dial(@RequestBody Map<String, Object> body) {
        String phone = body == null || body.get("phone") == null ? "" : String.valueOf(body.get("phone")).trim();
        if (!StringUtils.hasText(phone)) return R.fail("缺少被叫号码");
        // 坐席身份只取当前登录人，禁止通过篡改 userId 冒用同事工作手机外呼。
        Long userId = SecurityUtils.getCurrentUserId();
        BizYunkeUserMap map = mapMapper.selectOne(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, requireTenantId())
                .eq(BizYunkeUserMap::getUserId, userId).last("limit 1"));
        if (map == null || !StringUtils.hasText(map.getYunkeUserId())) {
            return R.fail("该坐席还没开通云客外呼,请先到「员工云客关联」里开通");
        }
        try {
            JsonNode r = yunkeClient.callAs(map.getYunkeUserId(), "/open/call/partnerCustomer",
                    Map.of("phone", phone, "callModel", "6"));
            String callId = r.path("data").asText("");
            if (r.path("success").asBoolean(false) && StringUtils.hasText(callId)) {
                Map<String, Object> out = new HashMap<>();
                out.put("callId", callId);
                out.put("message", "已通知工作手机拨号,请留意手机");
                return R.ok(out);
            }
            String message = r.path("success").asBoolean(false) && !StringUtils.hasText(callId)
                    ? "平台未返回外呼标识，无法使用系统按钮挂断"
                    : "平台未完成拨号";
            return R.fail(message + "，请确认该员工的工作手机已登录并在线");
        } catch (Exception e) {
            return integrationFailure("外呼", e);
        }
    }

    /**
     * 点击挂断:用云客外呼返回的 callId 通知员工工作手机真实挂断。
     */
    @PostMapping("/hangup")
    @Log(module = "云客外呼", type = Log.OperationType.OTHER)
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> hangup(@RequestBody Map<String, Object> body) {
        String callId = body == null || body.get("callId") == null ? "" : String.valueOf(body.get("callId")).trim();
        if (!StringUtils.hasText(callId)) return R.fail("缺少外呼标识callId,无法通知工作手机挂断");
        // 与拨号保持同一身份边界，只允许挂断当前登录坐席的通话。
        Long userId = SecurityUtils.getCurrentUserId();
        BizYunkeUserMap map = mapMapper.selectOne(new LambdaQueryWrapper<BizYunkeUserMap>()
                .eq(BizYunkeUserMap::getTenantId, requireTenantId())
                .eq(BizYunkeUserMap::getUserId, userId).last("limit 1"));
        if (map == null || !StringUtils.hasText(map.getYunkeUserId())) {
            return R.fail("该坐席还没开通云客外呼,请先到「员工云客关联」里开通");
        }
        try {
            JsonNode r = yunkeClient.callAs(map.getYunkeUserId(), "/open/call/hangUp",
                    Map.of("callId", callId));
            if (r.path("success").asBoolean(false)) {
                Map<String, Object> out = new HashMap<>();
                out.put("callId", r.path("data").asText(callId));
                out.put("message", "已通知工作手机挂断");
                return R.ok(out);
            }
            return R.fail("平台未完成挂断，请确认工作手机在线或通话尚未结束");
        } catch (Exception e) {
            return integrationFailure("挂断", e);
        }
    }

    /**
     * 新增好友统计:某时间段公司新增微信好友明细。
     * 云客 /open/wechat/listAddFriendWeChatUser,返回每条:员工(userName/userPhone)、
     * 好友(nickName/alias/wxPhone)、添加时间(addFriendTime)。
     */
    @GetMapping("/new-friends")
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> newFriends(@RequestParam(required = false) String beginYmd,
                                             @RequestParam(required = false) String endYmd,
                                             @RequestParam(defaultValue = "1") Integer pageNum,
                                             @RequestParam(defaultValue = "100") Integer pageSize) {
        try {
            YunkeConfig cfg = yunkeClient.getConfig();
            LocalDate end = StringUtils.hasText(endYmd) ? LocalDate.parse(endYmd) : LocalDate.now();
            LocalDate begin = StringUtils.hasText(beginYmd) ? LocalDate.parse(beginYmd) : end.minusDays(6);
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("companyCode", cfg != null ? cfg.getCompany() : "");
            reqBody.put("start", begin.toString());
            reqBody.put("end", end.toString());
            reqBody.put("pageNum", pageNum);
            reqBody.put("pageSize", pageSize);
            JsonNode r = yunkeClient.call("/open/wechat/listAddFriendWeChatUser", reqBody);
            Set<String> visiblePhones = visibleSystemPhones();
            List<Object> visibleRows = new ArrayList<>();
            for (JsonNode row : r.path("data").path("data")) {
                String userPhone = row.path("userPhone").asText("");
                if (visiblePhones == null || visiblePhones.contains(userPhone)) {
                    visibleRows.add(objectMapper.convertValue(row, Object.class));
                }
            }
            Map<String, Object> out = new HashMap<>();
            out.put("list", visibleRows);
            out.put("total", visibleRows.size());
            out.put("beginYmd", begin.toString());
            out.put("endYmd", end.toString());
            return R.ok(out);
        } catch (Exception e) {
            return integrationFailure("拉取新增好友", e);
        }
    }

    /**
     * 朋友圈:查某员工微信(wechatId)发的朋友圈。
     * 云客 /open/wechat/queryMoments,仅返回该 wechatId 自己发的朋友圈。
     */
    @GetMapping("/moments")
    @PreAuthorize("@perm.hasModule('crm')")
    public R<Map<String, Object>> moments(@RequestParam String wechatId,
                                          @RequestParam(required = false) String beginYmd,
                                          @RequestParam(required = false) String endYmd) {
        assertOwnWechat(wechatId);
        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("wechatId", wechatId);
            if (StringUtils.hasText(beginYmd)) reqBody.put("startTime", beginYmd + " 00:00:00");
            if (StringUtils.hasText(endYmd)) reqBody.put("endTime", endYmd + " 23:59:59");
            JsonNode r = yunkeClient.call("/open/wechat/queryMoments", reqBody);
            Map<String, Object> out = new HashMap<>();
            out.put("list", objectMapper.convertValue(r.path("data").path("data"), Object.class));
            out.put("nickname", r.path("data").path("saleNickName").asText(""));
            return R.ok(out);
        } catch (Exception e) {
            return integrationFailure("拉取朋友圈", e);
        }
    }

    /**
     * 微信语音通话列表:某时间段的微信语音/视频通话记录(含时长、录音、双方、接通状态)。
     * 云客 /open/wechat/queryWeChatVoiceList。callType 1语音2视频, isSend 0呼入1呼出。
     */
    @GetMapping("/voice-list")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin')")
    public R<Map<String, Object>> voiceList(@RequestParam(required = false) String beginYmd,
                                            @RequestParam(required = false) String endYmd,
                                            @RequestParam(required = false) Integer callType,
                                            @RequestParam(required = false) Integer isSend,
                                            @RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "50") Integer pageSize,
                                            HttpServletRequest request) {
        try {
            LocalDate end = StringUtils.hasText(endYmd) ? LocalDate.parse(endYmd) : LocalDate.now();
            LocalDate begin = StringUtils.hasText(beginYmd) ? LocalDate.parse(beginYmd) : end.minusDays(6);
            if (begin.isAfter(end)) throw new BusinessException("开始日期不能晚于结束日期");
            if (end.isAfter(LocalDate.now())) throw new BusinessException("不能查询未来日期");
            if (java.time.temporal.ChronoUnit.DAYS.between(begin, end) + 1 > 31) {
                throw new BusinessException("单次最多查询31天录音");
            }
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("pageNum", Math.max(1, pageNum));
            reqBody.put("pageSize", Math.max(10, Math.min(100, pageSize)));
            reqBody.put("startTime", begin + " 00:00:00");
            reqBody.put("endTime", end + " 23:59:59");
            reqBody.put("sort", 1);
            if (callType != null) reqBody.put("callType", callType);
            if (isSend != null) reqBody.put("isSend", isSend);
            JsonNode r = yunkeClient.call("/open/wechat/queryWeChatVoiceList", reqBody);
            Map<String, Object> out = new HashMap<>();
            List<Map<String, Object>> safeRows = new ArrayList<>();
            JsonNode sourceRows = r.path("data").path("data");
            if (sourceRows.isArray()) {
                for (JsonNode sourceRow : sourceRows) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> row = objectMapper.convertValue(sourceRow, LinkedHashMap.class);
                    String recordingUrl = removeRecordingUrl(row);
                    row.put("recordingAvailable", StringUtils.hasText(recordingUrl));
                    row.put("recordingStatus", StringUtils.hasText(recordingUrl) ? "available" : "missing");
                    if (StringUtils.hasText(recordingUrl)) {
                        try {
                            var ticket = callRecordingService.issueExternalTicket(recordingUrl,
                                    request.getHeader(org.springframework.http.HttpHeaders.USER_AGENT));
                            row.put("recordingToken", ticket.getToken());
                            row.put("recordingExpiresAt", ticket.getExpiresAt());
                        } catch (RuntimeException exception) {
                            row.put("recordingAvailable", false);
                            row.put("recordingStatus", "unavailable");
                            log.warn("云客微信语音录音票据生成失败: type={}", exception.getClass().getSimpleName());
                        }
                    }
                    safeRows.add(row);
                }
            }
            out.put("list", safeRows);
            out.put("total", r.path("data").path("total").asInt(0));
            out.put("beginYmd", begin.toString());
            out.put("endYmd", end.toString());
            return R.ok(out);
        } catch (Exception e) {
            return integrationFailure("拉取语音通话", e);
        }
    }

    private String removeRecordingUrl(Map<String, Object> row) {
        String recordingUrl = null;
        for (String field : List.of("ossFileName", "recordUrl", "recordingUrl", "voiceUrl", "fileUrl")) {
            Object value = row.remove(field);
            if (!StringUtils.hasText(recordingUrl) && value instanceof String text && StringUtils.hasText(text)) {
                recordingUrl = text.trim();
            }
        }
        return recordingUrl;
    }

    /**
     * 可开通外呼的员工列表(供「员工云客关联」用):查 sys_user 返回 id/姓名/手机。
     * 独立于 /system/user/list,不要求 system 管理权限,销售/管理层登录即可用。
     */
    @GetMapping("/staff-candidates")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<List<Map<String, Object>>> staffCandidates() {
        // 只返回"有对应在职员工档案(按手机匹配)"的登录账号,过滤掉超级管理员/无员工档案/已软删的账号,
        // 与「员工与账号」口径一致(deleted=0 由逻辑删除自动生效)。
        List<OrgEmployee> emps = orgEmployeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                .eq(OrgEmployee::getTenantId, requireTenantId())
                .in(OrgEmployee::getStatus, 1, 2)
                .isNotNull(OrgEmployee::getPhone)
                .ne(OrgEmployee::getPhone, ""));
        java.util.Set<String> empPhones = new java.util.HashSet<>();
        for (OrgEmployee e : emps) empPhones.add(e.getPhone());
        List<SysUser> users = sysUserMapper.selectList(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getTenantId, requireTenantId())
                .orderByAsc(SysUser::getId));
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        Set<Long> visibleSet = visibleUserIds == null ? null : Set.copyOf(visibleUserIds);
        List<Map<String, Object>> list = new ArrayList<>();
        for (SysUser u : users) {
            if (visibleSet != null && !visibleSet.contains(u.getId())) continue;
            if (u.getPhone() == null || !empPhones.contains(u.getPhone())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getNickname());
            m.put("phone", u.getPhone());
            list.add(m);
        }
        return R.ok(list);
    }

    /**
     * 部门+成员树(供员工微信列表左侧组织架构):调云客 deptAndUsers,
     * 递归成 部门name + 该部门(含子部门)所有成员手机号 + 子部门。前端按手机号筛选员工微信。
     */
    @GetMapping("/dept-tree")
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<List<Map<String, Object>>> deptTree() {
        List<Map<String, Object>> tree = new ArrayList<>();
        try {
            JsonNode r = yunkeClient.call("/open/department/newTree/deptAndUsers", new HashMap<>());
            Set<String> visiblePhones = visibleSystemPhones();
            for (JsonNode node : r.path("data").path("sub")) {
                Map<String, Object> d = buildDept(node, visiblePhones);
                if (d != null && (visiblePhones == null || ((Number) d.get("count")).intValue() > 0)) {
                    tree.add(d);
                }
            }
        } catch (Exception e) {
            return integrationFailure("拉取部门", e);
        }
        return R.ok(tree);
    }

    /**
     * 聊天正文和个人朋友圈属于员工一对一隐私。在审计授权规则明确前，即使老板或平台管理员
     * 也只能读取自己已关联的微信号，避免通过篡改 wechatId 直链查看他人会话。
     */
    /**
     * 校验当前用户可查看该员工微信的聊天/朋友圈。
     * 与员工微信列表(wechat-staff-list 第261行 visibleWechatIds 过滤)用同一可见性口径:
     * 数据范围=全部(返回null,老板/管理员)→放行;否则须是范围内员工在「员工云客关联」绑定的微信。
     * 若改回"仅本人绑定微信可看",列表能看到的人点开会 403,前后不一致。
     */
    private void assertOwnWechat(String wechatId) {
        Set<String> visible = visibleWechatIds();
        if (visible == null || visible.contains(wechatId)) {
            return;
        }
        throw new AccessDeniedException("无权查看该员工的微信内容(不在你的数据范围内)");
    }

    /** 当前数据范围内已关联的微信号；null 表示全公司可见。 */
    private Set<String> visibleWechatIds() {
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds == null) {
            return null;
        }
        return mapMapper.selectList(new LambdaQueryWrapper<BizYunkeUserMap>()
                        .eq(BizYunkeUserMap::getTenantId, requireTenantId())
                        .in(BizYunkeUserMap::getUserId, visibleUserIds))
                .stream()
                .map(BizYunkeUserMap::getYunkeWechatId)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
    }

    /** 当前数据范围内员工工作手机；null 表示全公司可见。 */
    private Set<String> visibleSystemPhones() {
        List<Long> visibleUserIds = dataScopeHelper.getVisibleUserIds();
        if (visibleUserIds == null) {
            return null;
        }
        return sysUserMapper.selectList(new LambdaQueryWrapper<SysUser>()
                        .select(SysUser::getPhone)
                        .eq(SysUser::getTenantId, requireTenantId())
                        .in(SysUser::getId, visibleUserIds))
                .stream()
                .map(SysUser::getPhone)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
    }

    /** 递归构建部门节点:id/name + 成员手机号(含子部门) + 子部门 children */
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildDept(JsonNode node, Set<String> visiblePhones) {
        if (!"DEPT".equals(node.path("type").asText(""))) return null;
        Map<String, Object> d = new HashMap<>();
        d.put("id", node.path("id").asText(node.path("name").asText("")));
        d.put("name", node.path("name").asText(""));
        List<String> phones = new ArrayList<>();
        List<Map<String, Object>> children = new ArrayList<>();
        for (JsonNode c : node.path("sub")) {
            String t = c.path("type").asText("");
            if ("USER".equals(t)) {
                String p = c.path("phone").asText("");
                if (!p.isEmpty() && (visiblePhones == null || visiblePhones.contains(p))) phones.add(p);
            } else if ("DEPT".equals(t)) {
                Map<String, Object> child = buildDept(c, visiblePhones);
                if (child != null && (visiblePhones == null || ((Number) child.get("count")).intValue() > 0)) {
                    children.add(child);
                    List<String> cp = (List<String>) child.get("phones");
                    if (cp != null) phones.addAll(cp);
                }
            }
        }
        d.put("phones", phones);
        d.put("count", phones.size());
        if (!children.isEmpty()) d.put("children", children);
        return d;
    }

    /** 组织架构 工作手机→员工姓名 映射(用于员工微信列表"实际使用人") */
    private Map<String, String> buildPhoneNameMap() {
        Map<String, String> map = new HashMap<>();
        try {
            JsonNode r = yunkeClient.call("/open/department/newTree/deptAndUsers", new HashMap<>());
            collectUsers(r.path("data"), map);
        } catch (Exception e) {
            logIntegrationFailure("组织架构姓名映射", e);
        }
        return map;
    }

    private void collectUsers(JsonNode node, Map<String, String> map) {
        for (JsonNode c : node.path("sub")) {
            String t = c.path("type").asText("");
            if ("USER".equals(t)) {
                String phone = c.path("phone").asText("");
                String name = c.path("name").asText("");
                if (name.isEmpty()) name = c.path("userName").asText("");
                if (name.isEmpty()) name = c.path("realName").asText("");
                if (name.isEmpty()) name = c.path("nickName").asText("");
                if (!phone.isEmpty() && !name.isEmpty()) map.putIfAbsent(phone, name);
            } else if ("DEPT".equals(t)) {
                collectUsers(c, map);
            }
        }
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文,请重新登录");
        }
        return tenantId;
    }

    private <T> R<T> integrationFailure(String operation, Exception exception) {
        logIntegrationFailure(operation, exception);
        return R.fail(operation + "失败，云客服务暂时不可用");
    }

    private void logIntegrationFailure(String operation, Exception exception) {
        log.warn("[云客] {}失败 type={}", operation, exception.getClass().getSimpleName());
    }
}
