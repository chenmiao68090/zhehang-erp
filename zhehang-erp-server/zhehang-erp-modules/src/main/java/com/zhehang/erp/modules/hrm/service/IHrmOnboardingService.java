package com.zhehang.erp.modules.hrm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.hrm.domain.entity.HrmOnboarding;

import java.util.Map;

public interface IHrmOnboardingService extends IService<HrmOnboarding> {
    IPage<HrmOnboarding> selectPage(int pageNum, int pageSize, String keyword, Integer status);

    HrmOnboarding createFromResume(Long resumeId);

    /** 候选人在流转里被淘汰/未入职时,取消其未完成的待入职记录(状态置为 7 取消),使其从待入职列表移出。 */
    void cancelByResume(Long resumeId);

    HrmOnboarding publicInfo(String token);

    void submitPublicForm(String token, Map<String, Object> payload, String clientIp);

    HrmOnboarding refreshPublicToken(Long id);

    void confirmForm(Long id);

    HrmOnboarding generateOffer(Long id, HrmOnboarding payload);

    void markOfferSent(Long id);

    HrmOnboarding createEmployeeDraft(Long id);

    void markOnboarded(Long id);
}
