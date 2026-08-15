package com.zhehang.erp.modules.im.realtime;

import java.time.LocalDateTime;
import java.util.Collection;

public interface ImEventPublisher {
    void publish(String eventType, Collection<Long> userIds, Object data);
    boolean isOnline(Long userId);
    LocalDateTime lastActiveAt(Long userId);
}
