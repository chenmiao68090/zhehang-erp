package com.zhehang.erp.modules.steward.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.partner.domain.BizPartner;
import com.zhehang.erp.modules.partner.mapper.BizPartnerMapper;
import com.zhehang.erp.modules.steward.domain.BizStewardClient;
import com.zhehang.erp.modules.steward.mapper.BizStewardClientMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 管家体系·签约客户:售后客户中枢(服务工单/续费/沟通/看板都基于此)。
 */
@RestController
@RequestMapping("/steward/client")
@RequiredArgsConstructor
public class StewardClientController {

    private final BizStewardClientMapper clientMapper;
    private final BizPartnerMapper partnerMapper;

    /** 分页列表:支持公司名/管家搜索、状态过滤、到期范围(用于续费管理) */
    @GetMapping("/list")
    public R<IPage<BizStewardClient>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String stewardName,
            @RequestParam(required = false) Integer expireInDays) {
        LambdaQueryWrapper<BizStewardClient> qw = new LambdaQueryWrapper<BizStewardClient>()
                .and(StringUtils.hasText(keyword), w -> w.like(BizStewardClient::getCompanyName, keyword)
                        .or().like(BizStewardClient::getContact, keyword)
                        .or().like(BizStewardClient::getPhone, keyword))
                .eq(StringUtils.hasText(status), BizStewardClient::getStatus, status)
                .like(StringUtils.hasText(stewardName), BizStewardClient::getStewardName, stewardName);
        if (expireInDays != null) {
            // 续费管理:到期日在今天~今天+N天内(含已过期)
            qw.le(BizStewardClient::getExpireDate, LocalDate.now().plusDays(expireInDays));
            qw.orderByAsc(BizStewardClient::getExpireDate);
        } else {
            qw.orderByDesc(BizStewardClient::getId);
        }
        return R.ok(clientMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "管家·签约客户", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizStewardClient client) {
        if (client.getStatus() == null || client.getStatus().isBlank()) client.setStatus("serving");
        clientMapper.insert(client);
        return R.ok();
    }

    @PutMapping
    @Log(module = "管家·签约客户", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizStewardClient client) {
        clientMapper.updateById(client);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "管家·签约客户", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        clientMapper.deleteById(id);
        return R.ok();
    }

    /** 续费:把到期日更新为新日期,状态置服务中 */
    @PostMapping("/renew")
    @Log(module = "管家·签约客户", type = Log.OperationType.UPDATE)
    public R<Void> renew(@RequestBody BizStewardClient body) {
        if (body.getId() == null || body.getExpireDate() == null) return R.fail("缺少客户或新到期日");
        BizStewardClient c = clientMapper.selectById(body.getId());
        if (c == null) return R.fail("客户不存在");
        c.setExpireDate(body.getExpireDate());
        c.setStatus("serving");
        if (body.getContractAmount() != null) c.setContractAmount(body.getContractAmount());
        clientMapper.updateById(c);
        return R.ok();
    }

    /** 从「长期合作客户」批量导入为签约客户(按公司名去重,已存在的跳过) */
    @PostMapping("/import-from-partner")
    @Log(module = "管家·签约客户", type = Log.OperationType.INSERT)
    public R<Map<String, Object>> importFromPartner() {
        Set<String> existing = new HashSet<>();
        for (BizStewardClient c : clientMapper.selectList(new LambdaQueryWrapper<>())) {
            if (StringUtils.hasText(c.getCompanyName())) existing.add(c.getCompanyName());
        }
        List<BizPartner> partners = partnerMapper.selectList(new LambdaQueryWrapper<>());
        int created = 0, skipped = 0;
        for (BizPartner p : partners) {
            if (!StringUtils.hasText(p.getCompanyName())) continue;
            if (existing.contains(p.getCompanyName())) { skipped++; continue; }
            BizStewardClient c = new BizStewardClient();
            c.setCompanyName(p.getCompanyName());
            c.setContact(p.getContact());
            c.setPhone(p.getPhone());
            c.setStewardName(p.getBizOwnerName());
            c.setContractAmount(p.getMonthlyAvg());
            c.setServices(mapBizTypeToServices(p.getBizType()));
            c.setStatus("serving");
            clientMapper.insert(c);
            existing.add(p.getCompanyName());
            created++;
        }
        Map<String, Object> m = new HashMap<>();
        m.put("created", created);
        m.put("skipped", skipped);
        return R.ok(m);
    }

    /** 长期客户合作业务 → 签约客户服务项目 */
    private String mapBizTypeToServices(String bizType) {
        if (bizType == null) return null;
        switch (bizType) {
            case "seal": return "刻章";
            case "bill": return "代理记账";
            case "gs": return "工商注册";
            case "mixed": return "代理记账,工商注册";
            default: return null;
        }
    }

    /** 看板统计:总数/服务中/30天内到期/已过期/已流失/合同总额 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        List<BizStewardClient> all = clientMapper.selectList(new LambdaQueryWrapper<>());
        LocalDate today = LocalDate.now();
        LocalDate soon = today.plusDays(30);
        long serving = 0, expiring = 0, expired = 0, churned = 0;
        double amount = 0;
        for (BizStewardClient c : all) {
            if ("churned".equals(c.getStatus())) { churned++; continue; }
            amount += c.getContractAmount() == null ? 0 : c.getContractAmount().doubleValue();
            if (c.getExpireDate() != null) {
                if (c.getExpireDate().isBefore(today)) expired++;
                else if (!c.getExpireDate().isAfter(soon)) expiring++;
                else serving++;
            } else {
                serving++;
            }
        }
        Map<String, Object> m = new HashMap<>();
        m.put("total", all.size());
        m.put("serving", serving);
        m.put("expiring", expiring);
        m.put("expired", expired);
        m.put("churned", churned);
        m.put("amount", Math.round(amount * 100) / 100.0);
        return R.ok(m);
    }
}
