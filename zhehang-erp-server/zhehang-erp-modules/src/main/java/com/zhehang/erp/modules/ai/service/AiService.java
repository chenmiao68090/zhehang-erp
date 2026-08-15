package com.zhehang.erp.modules.ai.service;

import java.util.Map;

public interface AiService {
    String SERVICE_UNAVAILABLE_MESSAGE = "AI 分析服务暂时不可用，请稍后重试";

    String chat(String prompt, Map<String, Object> context);
    String getProviderName();
}
