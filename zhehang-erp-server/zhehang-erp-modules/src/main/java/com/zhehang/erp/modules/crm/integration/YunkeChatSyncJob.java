package com.zhehang.erp.modules.crm.integration;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.zhehang.erp.modules.crm.domain.BizWechatChat;
import com.zhehang.erp.modules.crm.domain.BizWechatFriendInfo;
import com.zhehang.erp.modules.crm.domain.BizWechatMsgStat;
import com.zhehang.erp.modules.crm.domain.YunkeConfig;
import com.zhehang.erp.modules.crm.mapper.BizWechatChatMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatFriendInfoMapper;
import com.zhehang.erp.modules.crm.mapper.BizWechatMsgStatMapper;
import com.zhehang.erp.modules.crm.mapper.YunkeConfigMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

/**
 * 云客聊天记录后台同步任务。
 *
 * <p>云客 /open/wechat/allRecords 限制严:5秒1次、入参 timestamp 必须早于当前30分钟、
 * 每次返回 [timestamp, timestamp+1小时] 的全公司聊天。因此实时查不现实,改为后台定时增量落库:
 * 每次从游标(chat_cursor)拉一段,存入 biz_wechat_chat,更新游标为返回的 end;
 * 点头像看聊天时从库快速查。</p>
 *
 * <p>仅在「云客对接配置」已启用且填了凭证时运行。首次游标从"当前-2小时"起。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class YunkeChatSyncJob {

    private final YunkeClient yunkeClient;
    private final YunkeConfigMapper configMapper;
    private final BizWechatChatMapper chatMapper;
    private final BizWechatFriendInfoMapper friendInfoMapper;
    private final BizWechatMsgStatMapper msgStatMapper;

    /** 每 2 分钟拉一次增量(可用 yunke.chat-sync-delay 覆盖) */
    @Scheduled(fixedDelayString = "${yunke.chat-sync-delay:120000}", initialDelay = 60000)
    public void sync() {
        for (YunkeConfig cfg : yunkeClient.listEnabledConfigs()) {
            syncMessages(cfg);
        }
    }

    private void syncMessages(YunkeConfig cfg) {
        try {
            long limit = System.currentTimeMillis() - 30 * 60 * 1000L;  // 只能拉早于当前30分钟的数据
            Long cursor = cfg.getChatCursor();
            if (cursor == null) cursor = System.currentTimeMillis() - 6 * 3600 * 1000L;  // 首次:最近6小时
            // 一次任务里循环拉多轮(每轮1小时、间隔5.5秒满足限频),快速把游标追到近30分钟
            int loops = 0;
            while (cursor < limit && loops++ < 10) {
                JsonNode resp = yunkeClient.call(cfg, "/open/wechat/allRecords", Map.of("timestamp", cursor));
                if (!resp.path("success").asBoolean(false)) {
                    log.warn("[云客聊天同步] tenant={} 平台返回失败", cfg.getTenantId());
                    break;
                }
                JsonNode data = resp.path("data");
                JsonNode messages = data.path("messages");
                int saved = 0;
                if (messages.isArray()) {
                    for (JsonNode m : messages) {
                        if (saveMsg(m, cfg)) saved++;
                    }
                }
                long end = data.path("end").asLong(0);
                cursor = end > cursor ? end : cursor + 3600 * 1000L;  // 前进(无数据也推进1小时)
                // 只更新 chat_cursor 一列:本类多个定时任务共用这一行配置,整行 updateById 会用
                // 本任务开跑时的旧快照覆盖掉其他任务(好友/群游标)刚写入的进度
                cfg.setChatCursor(cursor);
                configMapper.update(null, new LambdaUpdateWrapper<YunkeConfig>()
                        .eq(YunkeConfig::getId, cfg.getId())
                        .eq(YunkeConfig::getTenantId, cfg.getTenantId())
                        .set(YunkeConfig::getChatCursor, cursor));
                if (saved > 0) log.info("[云客聊天同步] tenant={} 落库 {} 条,游标→{}",
                        cfg.getTenantId(), saved, cursor);
                if (cursor < limit) Thread.sleep(5500);  // 5秒限频:还要继续则等一下
            }
        } catch (Exception e) {
            log.warn("[云客聊天同步] tenant={} 异常 type={}",
                    cfg.getTenantId(), e.getClass().getSimpleName());
        }
    }

    /** 存一条消息;按 (tenantId, wechatId, msgSvrId) 去重 */
    private boolean saveMsg(JsonNode m, YunkeConfig cfg) {
        try {
            String wxId = text(m, "wechatId");
            String msgSvrId = text(m, "msgSvrId");
            if (wxId == null || msgSvrId == null) return false;
            Long cnt = chatMapper.selectCount(new LambdaQueryWrapper<BizWechatChat>()
                    .eq(BizWechatChat::getTenantId, cfg.getTenantId())
                    .eq(BizWechatChat::getWechatId, wxId)
                    .eq(BizWechatChat::getMsgSvrId, msgSvrId));
            if (cnt != null && cnt > 0) return false;

            BizWechatChat c = new BizWechatChat();
            c.setTenantId(cfg.getTenantId());
            c.setCompanyCode(cfg.getCompany());
            c.setWechatId(wxId);
            c.setTalker(text(m, "talker"));
            c.setRoomid(text(m, "roomid"));
            c.setMine(m.path("mine").asBoolean(false) ? 1 : 0);
            c.setMsgType(m.path("type").asInt(0));
            c.setContent(text(m, "text"));
            c.setFileUrl(text(m, "file"));
            c.setFileTh(text(m, "fileTh"));
            c.setMsgSvrId(msgSvrId);
            long ts = m.path("createTime").asLong(m.path("timestamp").asLong(0));
            if (ts > 0) c.setMsgTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(ts), ZoneId.systemDefault()));
            chatMapper.insert(c);
            return true;
        } catch (Exception e) {
            return false;   // 并发重复插入等,跳过
        }
    }

    /** 每 10 分钟同步一次好友/群信息(昵称/头像/微信号),给聊天会话显示真实名+头像 */
    @Scheduled(fixedDelayString = "${yunke.friend-sync-delay:600000}", initialDelay = 90000)
    public void syncFriends() {
        for (YunkeConfig cfg : yunkeClient.listEnabledConfigs()) {
            syncFriends(cfg);
        }
    }

    private void syncFriends(YunkeConfig cfg) {
        // 好友(type=1)和群(type=2)各一轮:按 updateTime 升序增量翻页,单轮限页
        for (int type = 1; type <= 2; type++) {
            try {
                // 游标持久化(V169):从库接着上次的位置爬。此前游标是局部变量,每轮都从
                // 2020-01-01 重头、单轮120批到不了近期就作废 → 近一年多的好友永远同步不到,
                // 聊天会话大量只显示 wxid 无昵称头像。
                String start = type == 1 ? cfg.getFriendCursor() : cfg.getGroupCursor();
                if (!StringUtils.hasText(start)) start = "2020-01-01 00:00:00";
                int loops = 0;
                while (loops++ < 120) {
                    Map<String, Object> body = new HashMap<>();
                    body.put("type", type);
                    body.put("getFirstData", false);
                    body.put("queryMode", "updateTime");
                    body.put("startTime", start);
                    JsonNode r = yunkeClient.call(cfg, "/open/wechat/getAllFriendsIncrement", body);
                    if (!r.path("success").asBoolean(false)) break;
                    JsonNode arr = r.path("data").path("data");
                    if (!arr.isArray() || arr.size() == 0) break;
                    int saved = 0;
                    for (JsonNode f : arr) if (saveFriend(cfg.getTenantId(), f, type)) saved++;
                    String lastUpdate = arr.get(arr.size() - 1).path("updateTime").asText("");
                    if (saved > 0) log.info("[云客好友同步] type={} 本批 {} 条,游标→{}", type, arr.size(), lastUpdate);
                    if (!StringUtils.hasText(lastUpdate)) break;
                    // 末条 updateTime==起点(同秒边界卡住):游标+1秒跳过,继续拉后续(极端同秒超一批才会漏,罕见)
                    if (lastUpdate.equals(start)) {
                        try {
                            start = java.time.LocalDateTime.parse(lastUpdate, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                                    .plusSeconds(1).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                        } catch (Exception e) { break; }
                    } else {
                        start = lastUpdate;
                    }
                    // 每批落库游标(只更新本流的列,避免整行覆盖其他任务的游标),下轮从这继续
                    if (type == 1) cfg.setFriendCursor(start);
                    else cfg.setGroupCursor(start);
                    configMapper.update(null, new LambdaUpdateWrapper<YunkeConfig>()
                            .eq(YunkeConfig::getId, cfg.getId())
                            .eq(YunkeConfig::getTenantId, cfg.getTenantId())
                            .set(type == 1, YunkeConfig::getFriendCursor, start)
                            .set(type == 2, YunkeConfig::getGroupCursor, start));
                    Thread.sleep(5200);   // 限频:5秒1次
                }
            } catch (Exception e) {
                log.warn("[云客好友同步] tenant={} type={} 异常类型={}",
                        cfg.getTenantId(), type, e.getClass().getSimpleName());
            }
        }
    }

    /** upsert 好友信息:按 (tenantId, friendWxId, salesWechatId) 去重 */
    private boolean saveFriend(Long tenantId, JsonNode f, int type) {
        try {
            String fid = text(f, "id");
            if (fid == null) return false;
            String sales = text(f, "salesWechatId");
            BizWechatFriendInfo ex = friendInfoMapper.selectOne(new LambdaQueryWrapper<BizWechatFriendInfo>()
                    .eq(BizWechatFriendInfo::getTenantId, tenantId)
                    .eq(BizWechatFriendInfo::getFriendWxId, fid)
                    .eq(sales != null, BizWechatFriendInfo::getSalesWechatId, sales)
                    .last("limit 1"));
            BizWechatFriendInfo r = ex != null ? ex : new BizWechatFriendInfo();
            r.setTenantId(tenantId);
            r.setFriendWxId(fid);
            r.setSalesWechatId(sales);
            r.setNickname(text(f, "name"));
            r.setAlias(text(f, "alias"));
            r.setRemark(text(f, "remark"));
            r.setHeadUrl(text(f, "headUrl"));
            r.setPhone(text(f, "phone"));
            r.setRegion(text(f, "region"));
            r.setFriendType(type);
            String g = text(f, "gender");
            if (g != null) {
                try { r.setGender((int) Double.parseDouble(g)); } catch (Exception ignore) { }
            }
            if (ex != null) friendInfoMapper.updateById(r);
            else friendInfoMapper.insert(r);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /** 每 3 小时同步一次消息数(salesWechatStatisticsDetails 逐好友逐天,按微信号+日期聚合落库);页面查库不拖慢 */
    @Scheduled(fixedDelayString = "${yunke.msg-stat-delay:10800000}", initialDelay = 120000)
    public void syncMsgStat() {
        for (YunkeConfig cfg : yunkeClient.listEnabledConfigs()) {
            syncMsgStat(cfg);
        }
    }

    private void syncMsgStat(YunkeConfig cfg) {
        try {
            java.time.LocalDate end = java.time.LocalDate.now();
            java.time.LocalDate begin = end.minusDays(30);
            Map<String, int[]> agg = new HashMap<>();   // (wechatId|ymd) -> [send, recv]
            int p = 1;
            while (p <= 200) {
                Map<String, Object> body = new HashMap<>();
                body.put("beginYmd", begin.toString());
                body.put("endYmd", end.toString());
                body.put("page", p);
                body.put("size", 500);
                JsonNode r = yunkeClient.call(cfg, "/open/wechat/salesWechatStatisticsDetails", body);
                if (!r.path("success").asBoolean(false)) break;
                JsonNode arr = r.path("data").path("data");
                if (!arr.isArray() || arr.size() == 0) break;
                for (JsonNode d : arr) {
                    String wx = text(d, "wechatId");
                    String ymd = text(d, "ymd");
                    if (wx == null || ymd == null) continue;
                    int[] v = agg.computeIfAbsent(wx + "|" + ymd, k -> new int[2]);
                    v[0] += d.path("msgSendCount").asInt(0);
                    v[1] += d.path("msgReceiveCount").asInt(0);
                }
                int totalPages = r.path("data").path("totalPages").asInt(1);
                if (p >= totalPages) break;
                p++;
                Thread.sleep(1200);
            }
            int n = 0;
            for (Map.Entry<String, int[]> e : agg.entrySet()) {
                String[] kk = e.getKey().split("\\|");
                if (kk.length == 2 && saveMsgStat(cfg.getTenantId(), kk[0], kk[1],
                        e.getValue()[0], e.getValue()[1])) n++;
            }
            if (n > 0) log.info("[云客消息数同步] tenant={} 落库 {} 条(微信号×天),范围 {}~{}",
                    cfg.getTenantId(), n, begin, end);
        } catch (Exception e) {
            log.warn("[云客消息数同步] tenant={} 异常 type={}",
                    cfg.getTenantId(), e.getClass().getSimpleName());
        }
    }

    /** upsert 消息数:按 (tenantId, wechatId, ymd) 去重 */
    private boolean saveMsgStat(Long tenantId, String wx, String ymd, int send, int recv) {
        try {
            BizWechatMsgStat ex = msgStatMapper.selectOne(new LambdaQueryWrapper<BizWechatMsgStat>()
                    .eq(BizWechatMsgStat::getTenantId, tenantId)
                    .eq(BizWechatMsgStat::getWechatId, wx)
                    .eq(BizWechatMsgStat::getYmd, ymd)
                    .last("limit 1"));
            BizWechatMsgStat s = ex != null ? ex : new BizWechatMsgStat();
            s.setTenantId(tenantId);
            s.setWechatId(wx);
            s.setYmd(ymd);
            s.setSendCount(send);
            s.setRecvCount(recv);
            if (ex != null) msgStatMapper.updateById(s);
            else msgStatMapper.insert(s);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String text(JsonNode m, String key) {
        JsonNode v = m.get(key);
        if (v == null || v.isNull()) return null;
        String s = v.asText("");
        return s.isEmpty() ? null : s;
    }
}
