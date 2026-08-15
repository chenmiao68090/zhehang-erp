package com.zhehang.erp.modules.hrm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmRecruit;
import com.zhehang.erp.modules.hrm.domain.vo.HrmColleagueVO;
import com.zhehang.erp.modules.hrm.mapper.HrmRecruitMapper;
import com.zhehang.erp.modules.hrm.service.IHrmRecruitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HrmRecruitServiceImpl extends ServiceImpl<HrmRecruitMapper, HrmRecruit> implements IHrmRecruitService {

    private final HrmRecruitMapper recruitMapper;

    @Override
    public IPage<HrmRecruit> selectPage(int pageNum, int pageSize, String title, Long deptId, Integer status) {
        LambdaQueryWrapper<HrmRecruit> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(title), HrmRecruit::getTitle, title)
               .eq(deptId != null, HrmRecruit::getDeptId, deptId)
               .eq(status != null, HrmRecruit::getStatus, status)
               .orderByDesc(HrmRecruit::getCreateTime);
        return recruitMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void changeStatus(Long id, Integer status) {
        HrmRecruit recruit = recruitMapper.selectById(id);
        if (recruit == null) {
            throw new BusinessException("招聘需求不存在");
        }
        recruit.setStatus(status);
        if (Integer.valueOf(1).equals(status) && recruit.getPublishDate() == null) {
            recruit.setPublishDate(LocalDate.now());
        }
        recruitMapper.updateById(recruit);
    }

    @Override
    public List<HrmColleagueVO> listColleagues() {
        return recruitMapper.selectColleagues();
    }
}
