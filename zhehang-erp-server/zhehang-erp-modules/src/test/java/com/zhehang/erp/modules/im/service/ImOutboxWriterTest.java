package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.ImNotificationOutboxMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImOutboxWriterTest {
    @Mock private ImNotificationOutboxMapper mapper;

    @Test
    void repeatedEventIdReturnsExistingOutboxRow() {
        ImEntities.NotificationOutbox existing = new ImEntities.NotificationOutbox();
        existing.setId(77L);
        when(mapper.insert(any())).thenThrow(new DuplicateKeyException("duplicate"));
        when(mapper.selectOne(any())).thenReturn(existing);

        ImOutboxWriter writer = new ImOutboxWriter(mapper);
        Long id = writer.enqueue(9L, 9L, "receipt:12:confirmed", "receipt.confirmed", "{}");

        assertThat(id).isEqualTo(77L);
    }

    @Test
    void writerJoinsCallerTransaction() throws Exception {
        Method enqueue = ImOutboxWriter.class.getMethod(
                "enqueue", Long.class, Long.class, String.class, String.class, String.class);
        Transactional transactional = enqueue.getAnnotation(Transactional.class);

        assertThat(transactional).isNotNull();
        assertThat(transactional.propagation()).isEqualTo(Propagation.REQUIRED);
    }
}
