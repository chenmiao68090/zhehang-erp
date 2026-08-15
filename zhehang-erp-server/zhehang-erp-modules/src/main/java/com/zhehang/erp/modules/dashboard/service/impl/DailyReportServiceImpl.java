package com.zhehang.erp.modules.dashboard.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import com.zhehang.erp.modules.dashboard.domain.vo.ColleagueVO;
import com.zhehang.erp.modules.dashboard.domain.vo.DailyReportVO;
import com.zhehang.erp.modules.dashboard.mapper.DailyReportMapper;
import com.zhehang.erp.modules.dashboard.service.IDailyReportService;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DailyReportServiceImpl extends ServiceImpl<DailyReportMapper, DailyReport> implements IDailyReportService {

    private final OrgEmployeeMapper orgEmployeeMapper;
    private final ImBusinessNotificationPublisher notificationPublisher;

    @Override
    public List<DailyReport> listMine() {
        Long uid = SecurityUtils.getCurrentUserId();
        return list(new LambdaQueryWrapper<DailyReport>()
                .eq(DailyReport::getUserId, uid)
                .orderByDesc(DailyReport::getReportDate)
                .orderByDesc(DailyReport::getCreateTime)
                .last("limit 30"));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean add(DailyReport report) {
        report.setUserId(SecurityUtils.getCurrentUserId());
        boolean saved = save(report);
        // 保存成功后与日报同事务登记抄送事件，避免日报已保存但消息丢失。
        if (saved) {
            notifyCcUsers(report);
        }
        return saved;
    }

    /** 解析 cc_user_ids(逗号分隔 userId)并批量发送抄送通知。 */
    private void notifyCcUsers(DailyReport report) {
        if (!StringUtils.hasText(report.getCcUserIds())) {
            return;
        }
        List<Long> ccIds = new ArrayList<>();
        for (String part : report.getCcUserIds().split(",")) {
            String s = part.trim();
            if (s.isEmpty()) {
                continue;
            }
            try {
                ccIds.add(Long.valueOf(s));
            } catch (NumberFormatException ignore) {
                // 跳过非法 userId
            }
        }
        if (ccIds.isEmpty()) {
            return;
        }
        String author = SecurityUtils.getCurrentUsername();
        if (!StringUtils.hasText(author)) {
            author = "同事";
        }
        notificationPublisher.publish(ImBusinessNotificationPublisher.Notice.builder()
                .eventId("daily-report:" + report.getId() + ":cc")
                .eventType("daily_report.cc")
                .title("工作日报抄送")
                .text("【" + author + "】抄送了一份工作日报给你")
                .recipientIds(ccIds)
                .businessType("daily_report")
                .businessId(report.getId())
                .currentStatus("submitted")
                .responsibleId(report.getUserId())
                .requirement("请查看同事抄送的工作日报")
                .actionLabel("查看日报")
                .actionUrl("/dashboard/home")
                .build());
    }

    @Override
    public boolean removeMine(Long id) {
        Long uid = SecurityUtils.getCurrentUserId();
        // 归属校验:只能删自己的日报(条件删除,非本人匹配不到行)
        return remove(new LambdaQueryWrapper<DailyReport>()
                .eq(DailyReport::getId, id)
                .eq(DailyReport::getUserId, uid));
    }

    @Override
    public List<ColleagueVO> listColleagues() {
        return baseMapper.selectColleagues();
    }

    @Override
    public List<DailyReportVO> listCcToMe() {
        Long uid = SecurityUtils.getCurrentUserId();
        if (uid == null) {
            return List.of();
        }
        // cc_user_ids 逗号分隔存 userId;FIND_IN_SET 命中当前用户
        List<DailyReport> reports = list(new LambdaQueryWrapper<DailyReport>()
                .apply("FIND_IN_SET({0}, cc_user_ids) > 0", uid)
                .orderByDesc(DailyReport::getReportDate)
                .orderByDesc(DailyReport::getCreateTime)
                .last("limit 30"));
        if (CollectionUtils.isEmpty(reports)) {
            return List.of();
        }
        // 批量取作者姓名:user_id -> name(查不到回退空)
        Set<Long> authorIds = reports.stream()
                .map(DailyReport::getUserId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, String> nameByUserId = new HashMap<>();
        if (!authorIds.isEmpty()) {
            List<OrgEmployee> emps = orgEmployeeMapper.selectList(
                    new LambdaQueryWrapper<OrgEmployee>()
                            .select(OrgEmployee::getUserId, OrgEmployee::getName)
                            .in(OrgEmployee::getUserId, authorIds));
            for (OrgEmployee e : emps) {
                if (e.getUserId() != null && !nameByUserId.containsKey(e.getUserId())) {
                    nameByUserId.put(e.getUserId(), e.getName());
                }
            }
        }
        return reports.stream().map(r -> {
            DailyReportVO vo = new DailyReportVO();
            BeanUtils.copyProperties(r, vo);
            vo.setAuthorName(nameByUserId.getOrDefault(r.getUserId(), ""));
            return vo;
        }).collect(Collectors.toList());
    }
}
