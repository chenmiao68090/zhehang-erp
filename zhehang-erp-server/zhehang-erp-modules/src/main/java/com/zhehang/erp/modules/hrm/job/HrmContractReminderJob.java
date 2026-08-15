package com.zhehang.erp.modules.hrm.job;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.modules.org.domain.entity.OrgEmployee;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * 合同到期主动提醒 HR 定时任务。
 *
 * <p>落地业务诉求"员工劳动合同快到期了,系统要主动提醒 HR 续签":
 * 每天 09:00 扫描合同结束日({@code contractEnd})落在 [今天, 今天+15天] 区间内的在职员工,
 * 为每人生成一条站内待办 {@link BizTask},接收人为 hr 角色用户(兜底不指派,进"待指派"由 HR 主管认领)。</p>
 *
 * <p>定时任务无登录租户上下文,{@code ErpTenantHandler} 在此场景放行租户过滤,故对全部租户生效(系统级任务)。</p>
 *
 * <p>幂等:同一员工、同一到期日,只生成一条待办——通过待办的 {@code bizType=hrm_contract}、
 * {@code bizId=员工ID}、标题含到期日 去重;员工续签后到期日变化会重新提醒。</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HrmContractReminderJob {

    /** 提前提醒天数:合同将在 N 天内到期就提醒 */
    private static final int REMIND_AHEAD_DAYS = 15;

    /** 待办关联业务类型,用于去重 */
    private static final String BIZ_TYPE = "hrm_contract";

    /** 接收待办的角色标识(人事) */
    private static final String HR_ROLE_KEY = "hr";

    private final OrgEmployeeMapper employeeMapper;
    private final BizTaskMapper taskMapper;
    private final IBizTaskService taskService;
    private final SysUserMapper userMapper;

    /** 每天 09:00 扫描即将到期的员工合同,提醒 HR 续签 */
    @Scheduled(cron = "0 0 9 * * ?")
    public void run() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate deadline = today.plusDays(REMIND_AHEAD_DAYS);

            // 在职(status=1)且合同结束日在 [今天, 今天+15天] 的员工
            List<OrgEmployee> employees = employeeMapper.selectList(new LambdaQueryWrapper<OrgEmployee>()
                    .eq(OrgEmployee::getStatus, 1)
                    .isNotNull(OrgEmployee::getContractEnd)
                    .ge(OrgEmployee::getContractEnd, today)
                    .le(OrgEmployee::getContractEnd, deadline));

            if (employees.isEmpty()) {
                log.info("[定时] 合同到期提醒:近 {} 天无在职员工合同到期", REMIND_AHEAD_DAYS);
                return;
            }

            // 接收人:hr 角色第一个用户;查不到则留空(待办进"待指派")
            Long hrUserId = userMapper.selectFirstUserIdByRoleKey(HR_ROLE_KEY);
            if (hrUserId == null) {
                log.warn("[定时] 合同到期提醒:未找到 hr 角色用户,待办将进入待指派状态");
            }

            int created = 0;
            for (OrgEmployee emp : employees) {
                String endDate = emp.getContractEnd().toString();
                String title = "员工" + emp.getName() + "合同将于" + endDate + "到期,请及时续签";

                // 幂等:同一员工 + 同一到期日(标题含到期日)已存在待办则跳过
                Long exists = taskMapper.selectCount(new LambdaQueryWrapper<BizTask>()
                        .eq(BizTask::getBizType, BIZ_TYPE)
                        .eq(BizTask::getBizId, emp.getId())
                        .eq(BizTask::getTitle, title));
                if (exists != null && exists > 0) {
                    continue;
                }

                BizTask task = new BizTask();
                task.setTitle(title);
                task.setTaskType("followup");
                task.setBizId(emp.getId());
                task.setBizType(BIZ_TYPE);
                task.setPriority(3); // 高
                task.setDescription("员工[" + emp.getName() + "]劳动合同将于 " + endDate
                        + " 到期,请人事及时跟进续签或办理离职手续。");
                if (hrUserId != null) {
                    task.setExecutorId(hrUserId); // 指派给 HR → 状态置"待执行"
                }
                task.setTenantId(emp.getTenantId()); // 定时任务无登录上下文,显式落员工自身租户,否则 insertFill 写入 null → HR(租户1)看不到
                taskService.createTask(task);
                created++;
            }

            log.info("[定时] 合同到期提醒完成:命中 {} 人,新建待办 {} 条", employees.size(), created);
        } catch (Exception e) {
            log.error("[定时] 合同到期提醒异常", e);
        }
    }
}
