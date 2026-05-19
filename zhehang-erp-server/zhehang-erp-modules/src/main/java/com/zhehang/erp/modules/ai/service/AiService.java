package com.zhehang.erp.modules.ai.service;

import java.util.Map;

public interface AiService {
    String chat(String prompt, Map<String, Object> context);
    String getProviderName();
}