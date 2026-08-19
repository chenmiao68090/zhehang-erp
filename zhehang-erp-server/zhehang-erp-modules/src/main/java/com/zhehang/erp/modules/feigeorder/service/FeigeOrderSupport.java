package com.zhehang.erp.modules.feigeorder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeAccountingContract;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrder;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderOperationLog;
import com.zhehang.erp.modules.feigeorder.domain.entity.FeigeOrderStep;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderOperationLogMapper;
import com.zhehang.erp.modules.feigeorder.mapper.FeigeOrderStepMapper;
import com.zhehang.erp.modules.feigetask.service.FeigeOrderTaskBridgeService;
import com.zhehang.erp.modules.system.domain.entity.SysDept;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.BUSINESS_TYPE_SEAL;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_COMPLETED;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ORDER_IN_PROGRESS;
import static com.zhehang.erp.modules.feigeorder.service.FeigeOrderConstants.ZERO;

/**
 * 飞哥版订单/合同域的共享支撑能力，供订单、审核、合同、退费四个领域 Service 复用。
 *
 * <p>集中承担：订单行读取与数据范围校验、订单流程步骤流水、操作日志、人员/部门名称解析、
 * 审核角色校验、JSON 快照，以及金额与文本的纯函数工具。本类不承载任何领域业务流程，
 * 领域编排一律留在各自的领域 Service 中。</p>
 */
@Service
@RequiredArgsConstructor
public class FeigeOrderSupport {

    private final FeigeOrderMapper orderMapper;
    private final FeigeOrderOperationLogMapper operationLogMapper;
    private final FeigeOrderStepMapper orderStepMapper;
    private final SysUserMapper userMapper;
    private final SysDeptMapper deptMapper;
    private final DataScopeHelper dataScopeHelper;
    private final ObjectMapper objectMapper;
    private final FeigeOrderTaskBridgeService orderTaskBridgeService;

    public FeigeOrder requireOrder(Long id, boolean forUpdate) {
        FeigeOrder order;
        if (forUpdate) {
            order = orderMapper.selectOne(new LambdaQueryWrapper<FeigeOrder>()
                    .eq(FeigeOrder::getId, id).last("FOR UPDATE"));
        } else {
            order = orderMapper.selectById(id);
        }
        if (order == null) throw new BusinessException("飞哥版订单不存在");
        if (!dataScopeHelper.canAccess(order.getSalesmanId(), order.getDeptId())) {
            throw new AccessDeniedException("无权访问数据范围外的飞哥版订单");
        }
        return order;
    }

    public List<FeigeOrderOperationLog> selectLogs(Long orderId) {
        return operationLogMapper.selectList(new LambdaQueryWrapper<FeigeOrderOperationLog>()
                .eq(FeigeOrderOperationLog::getOrderId, orderId)
                .orderByDesc(FeigeOrderOperationLog::getCreateTime));
    }

    public List<FeigeOrderStep> selectOrderSteps(Long orderId) {
        return orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, orderId)
                .orderByAsc(FeigeOrderStep::getStepNo));
    }

    public void createDefaultOrderSteps(FeigeOrder order) {
        String[] names = {"财务审核", "资料交接", "服务办理", "交付确认"};
        for (int i = 0; i < names.length; i++) {
            FeigeOrderStep step = new FeigeOrderStep();
            step.setOrderId(order.getId());
            step.setStepNo(i + 1);
            step.setStepName(names[i]);
            step.setStatus(i == 0 ? "processing" : "pending");
            step.setAssigneeId(i == 0 ? null : order.getSalesmanId());
            step.setAssigneeName(i == 0 ? "财务审核" : order.getSalesmanName());
            orderStepMapper.insert(step);
        }
    }

    public void updateStepAfterAudit(FeigeOrder order, boolean approved, String remark) {
        List<FeigeOrderStep> steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, order.getId()).orderByAsc(FeigeOrderStep::getStepNo));
        if (steps.isEmpty()) {
            createDefaultOrderSteps(order);
            steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                    .eq(FeigeOrderStep::getOrderId, order.getId()).orderByAsc(FeigeOrderStep::getStepNo));
        }
        for (FeigeOrderStep step : steps) {
            if (Integer.valueOf(1).equals(step.getStepNo())) {
                step.setStatus(approved ? "completed" : "rejected");
                step.setCompletedTime(LocalDateTime.now());
                step.setRemark(trimToNull(remark));
                step.setAssigneeId(SecurityUtils.getCurrentUserId());
                step.setAssigneeName(resolveUserName(SecurityUtils.getCurrentUserId()));
                orderStepMapper.updateById(step);
            } else if (Integer.valueOf(2).equals(step.getStepNo())) {
                step.setStatus(approved ? "processing" : "pending");
                orderStepMapper.updateById(step);
            }
        }
    }

    public void completeAllOrderSteps(FeigeOrder order) {
        List<FeigeOrderStep> steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                .eq(FeigeOrderStep::getOrderId, order.getId()));
        if (steps.isEmpty()) {
            createDefaultOrderSteps(order);
            steps = orderStepMapper.selectList(new LambdaQueryWrapper<FeigeOrderStep>()
                    .eq(FeigeOrderStep::getOrderId, order.getId()));
        }
        for (FeigeOrderStep step : steps) {
            step.setStatus("completed");
            if (step.getCompletedTime() == null) step.setCompletedTime(LocalDateTime.now());
            orderStepMapper.updateById(step);
        }
    }

    public List<Map<String, Object>> staffOptions() {
        List<Long> visibleIds = dataScopeHelper.getVisibleUserIds();
        LambdaQueryWrapper<SysUser> query = new LambdaQueryWrapper<SysUser>()
                .select(SysUser::getId, SysUser::getNickname, SysUser::getUsername, SysUser::getDeptId)
                .eq(SysUser::getStatus, 0)
                .orderByAsc(SysUser::getDeptId)
                .orderByAsc(SysUser::getId);
        if (visibleIds != null) query.in(SysUser::getId, visibleIds);
        List<SysUser> users = userMapper.selectList(query);
        Map<Long, String> depts = resolveDeptNames(users.stream().map(SysUser::getDeptId).toList());
        List<Map<String, Object>> result = new ArrayList<>();
        for (SysUser user : users) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", user.getId());
            row.put("name", StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
            row.put("deptId", user.getDeptId());
            row.put("deptName", depts.get(user.getDeptId()));
            result.add(row);
        }
        return result;
    }

    public Owner resolveOwner(Long requestedUserId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long userId = requestedUserId == null ? currentUserId : requestedUserId;
        if (userId == null) throw new AccessDeniedException("当前登录身份无效");
        if (!Objects.equals(userId, currentUserId)) {
            if (!dataScopeHelper.isManagerOrAdmin() || !dataScopeHelper.canAccessOwner(userId)) {
                throw new AccessDeniedException("无权把订单分配给数据范围外人员");
            }
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException("负责人账号不存在或已停用");
        }
        String name = StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
        return new Owner(user.getId(), name, user.getDeptId());
    }

    public SysUser resolveVisibleStaff(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || !Integer.valueOf(0).equals(user.getStatus())) {
            throw new BusinessException("服务人员不存在或已停用");
        }
        if (!dataScopeHelper.canAccessOwner(user.getId())) {
            throw new AccessDeniedException("无权选择数据范围外的服务人员");
        }
        return user;
    }

    public String resolveOptionalStaffName(Long userId) {
        return userId == null ? null : displayName(resolveVisibleStaff(userId));
    }

    public String resolveUserName(Long userId) {
        if (userId == null) return SecurityUtils.getCurrentUsername();
        String name = dataScopeHelper.resolveUserNames(List.of(userId)).get(userId);
        return StringUtils.hasText(name) ? name : SecurityUtils.getCurrentUsername();
    }

    public Map<Long, String> resolveDeptNames(Collection<Long> deptIds) {
        List<Long> ids = deptIds.stream().filter(Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return deptMapper.selectList(new LambdaQueryWrapper<SysDept>()
                        .select(SysDept::getId, SysDept::getDeptName).in(SysDept::getId, ids))
                .stream().collect(Collectors.toMap(SysDept::getId, SysDept::getDeptName, (a, b) -> a));
    }

    public void log(Long orderId, String type, String desc, String remarks) {
        FeigeOrderOperationLog row = new FeigeOrderOperationLog();
        row.setOrderId(orderId);
        row.setOperationType(type);
        row.setOperationDesc(desc);
        row.setOperatorId(SecurityUtils.getCurrentUserId());
        row.setOperatorName(resolveUserName(SecurityUtils.getCurrentUserId()));
        row.setRemarks(trimToNull(remarks));
        operationLogMapper.insert(row);
    }

    public void enqueueTaskBridge(FeigeOrder order, String triggerEvent) {
        Long operatorId = SecurityUtils.getCurrentUserId();
        orderTaskBridgeService.enqueue(order, triggerEvent, operatorId, resolveUserName(operatorId));
    }

    public void requireReviewer() {
        if (!(dataScopeHelper.isManagerOrAdmin()
                || SecurityUtils.hasAnyRole("finance", "finance_hq", "boss"))) {
            throw new AccessDeniedException("仅主管、财务或老板可审核退费");
        }
    }

    public String writeJson(Object value) {
        if (value == null) return null;
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new BusinessException("业务扩展信息格式错误");
        }
    }

    public FeigeAccountingContract snapshotContract(FeigeAccountingContract source) {
        return objectMapper.convertValue(source, FeigeAccountingContract.class);
    }

    public static void requireFinanceReviewer() {
        if (!(SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("finance", "finance_hq", "boss"))) {
            throw new AccessDeniedException("仅财务、老板或超级管理员可执行财务审核");
        }
    }

    public static List<FeigeOrderStep> syntheticOrderSteps(FeigeOrder order) {
        String[] names = {"财务审核", "资料交接", "服务办理", "交付确认"};
        int completed = ORDER_COMPLETED.equals(order.getStatus()) ? 4
                : ORDER_IN_PROGRESS.equals(order.getStatus()) ? 1 : 0;
        List<FeigeOrderStep> result = new ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            FeigeOrderStep step = new FeigeOrderStep();
            step.setId(-(order.getId() * 10 + i + 1));
            step.setOrderId(order.getId());
            step.setStepNo(i + 1);
            step.setStepName(names[i]);
            step.setStatus(i < completed ? "completed" : i == completed ? "processing" : "pending");
            step.setAssigneeName(i == 0 ? "财务审核" : order.getSalesmanName());
            result.add(step);
        }
        return result;
    }

    public static Owner ownerFromOrder(FeigeOrder order) {
        return new Owner(order.getSalesmanId(), order.getSalesmanName(), order.getDeptId());
    }

    public static String displayName(SysUser user) {
        return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
    }

    public static boolean isSealBusiness(String businessType) {
        return BUSINESS_TYPE_SEAL.equalsIgnoreCase(businessType == null ? "" : businessType.trim());
    }

    public static void validateOrderAmounts(FeigeOrder order) {
        if (money(order.getReceivedAmount()).compareTo(money(order.getContractAmount())) > 0) {
            throw new BusinessException("已收金额不能超过合同金额");
        }
    }

    public static void validateContract(FeigeAccountingContract contract) {
        if (contract.getSignDate() != null && contract.getExpireDate() != null
                && contract.getExpireDate().isBefore(contract.getSignDate())) {
            throw new BusinessException("合同截止日期不能早于签署日期");
        }
    }

    public static void fillOutstanding(FeigeOrder order) {
        order.setOutstandingAmount(nonNegative(money(order.getContractAmount()).subtract(money(order.getReceivedAmount()))));
    }

    public static List<Long> parseIds(String value) {
        if (!StringUtils.hasText(value)) return List.of();
        try {
            return java.util.Arrays.stream(value.split(","))
                    .map(String::trim).filter(StringUtils::hasText).map(Long::valueOf).toList();
        } catch (NumberFormatException ex) {
            throw new BusinessException("交接记录中的合同清单无效");
        }
    }

    public static int monthsBetween(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) return 0;
        return Math.max(1, Math.toIntExact(ChronoUnit.MONTHS.between(start.withDayOfMonth(1),
                end.withDayOfMonth(1))) + 1);
    }

    public static int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    public static String optionalSuffix(String value) {
        return StringUtils.hasText(value) ? "：" + value.trim() : "";
    }

    public static <T> Page<T> page(int pageNum, int pageSize) {
        int safePage = Math.max(1, pageNum);
        int safeSize = Math.min(100, Math.max(1, pageSize));
        return new Page<>(safePage, safeSize);
    }

    public static BigDecimal money(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }

    public static BigDecimal nonNegative(BigDecimal value) {
        return value.compareTo(ZERO) < 0 ? ZERO : value.setScale(2, RoundingMode.HALF_UP);
    }

    public static String nextNo(String prefix) {
        return prefix + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"))
                + ThreadLocalRandom.current().nextInt(10, 100);
    }

    public static String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    public static String defaultText(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    public record Owner(Long userId, String name, Long deptId) {
    }
}
