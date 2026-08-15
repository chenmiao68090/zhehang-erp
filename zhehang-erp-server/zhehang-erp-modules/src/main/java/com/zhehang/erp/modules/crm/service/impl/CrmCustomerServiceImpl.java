package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmPool;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmPoolMapper;
import com.zhehang.erp.modules.crm.service.ICrmCustomerService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CrmCustomerServiceImpl extends ServiceImpl<CrmCustomerMapper, CrmCustomer> implements ICrmCustomerService {

    private final CrmCustomerMapper customerMapper;
    private final CrmPoolMapper poolMapper;
    private final DataScopeHelper dataScopeHelper;

    @Override
    public boolean save(CrmCustomer entity) {
        // 新建客户:未指定负责人时默认归属创建人,并按负责人补归属部门,确保创建人/主管能在数据权限下看到
        if (entity.getOwnerId() == null) {
            entity.setOwnerId(SecurityUtils.getCurrentUserId());
        }
        if (entity.getDeptId() == null) {
            entity.setDeptId(dataScopeHelper.deptIdOfUser(entity.getOwnerId()));
        }
        return super.save(entity);
    }

    @Override
    public IPage<CrmCustomer> selectPage(int pageNum, int pageSize, String name, String level, Integer status, Long ownerId) {
        LambdaQueryWrapper<CrmCustomer> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:电销只看自己、主管看本部门、管理员看全部
        dataScopeHelper.apply(wrapper, CrmCustomer::getOwnerId, CrmCustomer::getDeptId);
        wrapper.like(StringUtils.hasText(name), CrmCustomer::getName, name)
               .eq(StringUtils.hasText(level), CrmCustomer::getLevel, level)
               .eq(status != null, CrmCustomer::getStatus, status)
               .eq(ownerId != null, CrmCustomer::getOwnerId, ownerId)
               .orderByDesc(CrmCustomer::getCreateTime);
        return customerMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateAccessible(CrmCustomer input) {
        if (input == null || input.getId() == null) {
            throw new BusinessException(400, "客户ID不能为空");
        }
        CrmCustomer existing = requireAccessible(input.getId(), "修改");

        // 负责人、部门、租户和创建审计字段不能由通用编辑请求改写；重新分配必须走专用业务流程。
        input.setOwnerId(existing.getOwnerId());
        input.setDeptId(existing.getDeptId());
        input.setTenantId(existing.getTenantId());
        input.setCreateBy(existing.getCreateBy());
        input.setCreateTime(existing.getCreateTime());
        input.setUpdateBy(null);
        input.setUpdateTime(null);
        input.setDeleted(existing.getDeleted());

        LambdaUpdateWrapper<CrmCustomer> wrapper = scopedMutationWrapper(existing);
        if (customerMapper.update(input, wrapper) <= 0) {
            throw new BusinessException(409, "客户已发生变化，请刷新后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeAccessible(Long id) {
        CrmCustomer existing = requireAccessible(id, "删除");
        LambdaQueryWrapper<CrmCustomer> wrapper = new LambdaQueryWrapper<>();
        applyMutationSnapshot(wrapper, existing);
        if (customerMapper.delete(wrapper) <= 0) {
            throw new BusinessException(409, "客户已发生变化，请刷新后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void toPool(Long id, String reason) {
        CrmCustomer customer = requireAccessible(id, "退回公海");

        // 记录公海池
        CrmPool pool = new CrmPool();
        pool.setCustomerId(id);
        pool.setReturnReason(reason);
        pool.setReturnTime(LocalDateTime.now());
        pool.setReturnBy(customer.getOwnerId());
        if (poolMapper.insert(pool) <= 0) {
            throw new BusinessException("公海记录保存失败");
        }

        // 清除负责人与归属部门(退回公海后变为无主)
        // 用 lambdaUpdate 显式置 null:updateById 默认跳过 null 字段,setOwnerId(null) 不会真正清空
        LambdaUpdateWrapper<CrmCustomer> wrapper = scopedMutationWrapper(customer)
                .set(CrmCustomer::getOwnerId, null)
                .set(CrmCustomer::getDeptId, null);
        if (customerMapper.update(null, wrapper) <= 0) {
            throw new BusinessException(409, "客户已发生变化，请刷新后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void claimFromPool(Long customerId, Long ownerId) {
        CrmCustomer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }
        // 原子领取:仅当客户仍无主(owner_id 为 null)时更新成功(DB 行锁保证并发下只有一人成功,
        // 避免"读-判 ownerId 是否 null-写"在事务提交前被其他事务读到旧值导致的双重认领覆盖归属)
        boolean claimed = lambdaUpdate()
                .eq(CrmCustomer::getId, customerId)
                .isNull(CrmCustomer::getOwnerId)
                .set(CrmCustomer::getOwnerId, ownerId)
                .set(CrmCustomer::getDeptId, dataScopeHelper.deptIdOfUser(ownerId))
                .update();
        if (!claimed) {
            throw new BusinessException("该客户已被认领");
        }
    }

    private CrmCustomer requireAccessible(Long id, String action) {
        if (id == null) {
            throw new BusinessException(400, "客户ID不能为空");
        }
        CrmCustomer customer = customerMapper.selectById(id);
        if (customer == null) {
            throw new BusinessException(404, "客户不存在");
        }
        if (!dataScopeHelper.canAccess(customer.getOwnerId(), customer.getDeptId())) {
            throw new AccessDeniedException("无权" + action + "数据范围外的客户");
        }
        return customer;
    }

    private LambdaUpdateWrapper<CrmCustomer> scopedMutationWrapper(CrmCustomer existing) {
        LambdaUpdateWrapper<CrmCustomer> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(CrmCustomer::getId, existing.getId())
                .eq(existing.getOwnerId() != null, CrmCustomer::getOwnerId, existing.getOwnerId())
                .isNull(existing.getOwnerId() == null, CrmCustomer::getOwnerId)
                .eq(existing.getDeptId() != null, CrmCustomer::getDeptId, existing.getDeptId())
                .isNull(existing.getDeptId() == null, CrmCustomer::getDeptId);
        return wrapper;
    }

    private void applyMutationSnapshot(LambdaQueryWrapper<CrmCustomer> wrapper, CrmCustomer existing) {
        wrapper.eq(CrmCustomer::getId, existing.getId())
                .eq(existing.getOwnerId() != null, CrmCustomer::getOwnerId, existing.getOwnerId())
                .isNull(existing.getOwnerId() == null, CrmCustomer::getOwnerId)
                .eq(existing.getDeptId() != null, CrmCustomer::getDeptId, existing.getDeptId())
                .isNull(existing.getDeptId() == null, CrmCustomer::getDeptId);
    }
}
