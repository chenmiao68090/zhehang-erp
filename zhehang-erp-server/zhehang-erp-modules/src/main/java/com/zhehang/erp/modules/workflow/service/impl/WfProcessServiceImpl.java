package com.zhehang.erp.modules.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.workflow.domain.dto.WfProcessDefDTO;
import com.zhehang.erp.modules.workflow.domain.entity.WfProcessDef;
import com.zhehang.erp.modules.workflow.domain.entity.WfProcessVersion;
import com.zhehang.erp.modules.workflow.domain.vo.WfProcessDefVO;
import com.zhehang.erp.modules.workflow.mapper.WfProcessDefMapper;
import com.zhehang.erp.modules.workflow.mapper.WfProcessVersionMapper;
import com.zhehang.erp.modules.workflow.service.IWfInstanceService;
import com.zhehang.erp.modules.workflow.service.IWfProcessService;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WfProcessServiceImpl implements IWfProcessService {

    private final WfProcessDefMapper processDefMapper;
    private final WfProcessVersionMapper versionMapper;
    private final IWfInstanceService instanceService;

    @Override
    public List<WfProcessDefVO> list(String name, String category, Integer status) {
        LambdaQueryWrapper<WfProcessDef> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(WfProcessDef::getName, name);
        }
        if (StringUtils.hasText(category)) {
            wrapper.eq(WfProcessDef::getCategory, category);
        }
        if (status != null) {
            wrapper.eq(WfProcessDef::getStatus, status);
        }
        wrapper.orderByDesc(WfProcessDef::getCreateTime);
        List<WfProcessDef> list = processDefMapper.selectList(wrapper);
        return list.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public WfProcessDefVO getById(Long id) {
        WfProcessDef entity = processDefMapper.selectById(id);
        return entity != null ? toVO(entity) : null;
    }

    @Override
    public void createProcessDef(WfProcessDefDTO dto) {
        WfProcessDef entity = new WfProcessDef();
        BeanUtils.copyProperties(dto, entity);
        entity.setVersion(1);
        entity.setStatus(0); // 草稿
        processDefMapper.insert(entity);
    }

    @Override
    public void updateProcessDef(WfProcessDefDTO dto) {
        WfProcessDef entity = processDefMapper.selectById(dto.getId());
        if (entity == null) {
            throw new RuntimeException("流程定义不存在");
        }
        if (entity.getStatus() == 1) {
            throw new RuntimeException("已发布的流程不能直接修改，请停用后再编辑");
        }
        BeanUtils.copyProperties(dto, entity);
        processDefMapper.updateById(entity);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishProcess(Long defId) {
        WfProcessDef entity = processDefMapper.selectById(defId);
        if (entity == null) {
            throw new RuntimeException("流程定义不存在");
        }
        // 发布预检:任一审批节点解析不到人则禁止发布,并指明是哪个节点缺什么
        List<String> problems = instanceService.precheckProcessDef(defId);
        if (!problems.isEmpty()) {
            throw new BusinessException("发布被阻止,审批链存在解析不到审批人的节点:" + String.join(";", problems));
        }
        entity.setStatus(1);
        entity.setVersion(entity.getVersion() + 1);
        processDefMapper.updateById(entity);

        // 定格发布版本快照:此后发起的实例绑定本快照,再改定义/改节点名不影响在途单
        WfProcessVersion snapshot = new WfProcessVersion();
        snapshot.setProcessDefId(entity.getId());
        snapshot.setVersion(entity.getVersion());
        snapshot.setName(entity.getName());
        snapshot.setFormConfig(entity.getFormConfig());
        snapshot.setProcessConfig(entity.getProcessConfig());
        snapshot.setPublishBy(SecurityUtils.getCurrentUserId());
        snapshot.setPublishTime(LocalDateTime.now());
        versionMapper.insert(snapshot);
    }

    @Override
    public void disableProcess(Long defId) {
        WfProcessDef entity = processDefMapper.selectById(defId);
        if (entity == null) {
            throw new RuntimeException("流程定义不存在");
        }
        entity.setStatus(2);
        processDefMapper.updateById(entity);
    }

    @Override
    public void removeProcess(Long defId) {
        WfProcessDef entity = processDefMapper.selectById(defId);
        if (entity == null) {
            throw new RuntimeException("流程定义不存在");
        }
        // 逻辑删除(deleted=1,可恢复),不物理删数据
        processDefMapper.deleteById(defId);
    }

    /**
     * 模板走库:返回被标记为模板(is_template=1)且已发布(status=1)的真实流程定义。
     * 好处:模板本身就是过了发布预检的真实流程,审批人角色天然可解析,
     * 不再有旧硬编码模板引用 general_manager/purchase_manager/admin_manager 等不存在角色的死模板。
     */
    @Override
    public List<Map<String, Object>> getTemplates() {
        List<WfProcessDef> defs = processDefMapper.selectList(new LambdaQueryWrapper<WfProcessDef>()
                .eq(WfProcessDef::getIsTemplate, 1)
                .eq(WfProcessDef::getStatus, 1)
                .orderByAsc(WfProcessDef::getSort).orderByAsc(WfProcessDef::getId));
        List<Map<String, Object>> templates = new ArrayList<>();
        for (WfProcessDef d : defs) {
            Map<String, Object> tpl = new HashMap<>();
            tpl.put("key", d.getProcessKey());
            tpl.put("name", d.getName());
            tpl.put("category", d.getCategory());
            tpl.put("formConfig", d.getFormConfig());
            tpl.put("processConfig", d.getProcessConfig());
            templates.add(tpl);
        }
        return templates;
    }

    private WfProcessDefVO toVO(WfProcessDef entity) {
        WfProcessDefVO vo = new WfProcessDefVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
