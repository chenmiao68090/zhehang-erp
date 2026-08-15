package com.zhehang.erp.modules.im.mapper;

import com.zhehang.erp.modules.im.domain.ImModels;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ImQueryMapper {
    Long lockConversation(@Param("conversationId") Long conversationId);

    int incrementSequence(@Param("conversationId") Long conversationId);

    Long lastAllocatedSequence();

    int updateLastMessage(@Param("conversationId") Long conversationId,
                          @Param("messageId") Long messageId,
                          @Param("seq") Long seq,
                          @Param("messageAt") LocalDateTime messageAt);

    List<ImModels.Conversation> listConversations(@Param("userId") Long userId,
                                                   @Param("conversationId") Long conversationId,
                                                   @Param("filter") String filter,
                                                   @Param("keyword") String keyword,
                                                   @Param("cursorPinned") Integer cursorPinned,
                                                   @Param("cursorTime") LocalDateTime cursorTime,
                                                   @Param("cursorId") Long cursorId,
                                                   @Param("limit") int limit);

    ImModels.UnreadSummary unreadSummary(@Param("userId") Long userId);

    List<ImModels.Contact> searchContacts(@Param("userId") Long userId,
                                           @Param("keyword") String keyword,
                                           @Param("limit") int limit);

    List<ImModels.Contact> contactsByIds(@Param("userIds") List<Long> userIds);

    List<ImModels.Contact> conversationMembers(@Param("conversationId") Long conversationId);

    int activeUserInTenant(@Param("userId") Long userId,
                           @Param("tenantId") Long tenantId);

    int markRead(@Param("conversationId") Long conversationId,
                 @Param("userId") Long userId,
                 @Param("seq") Long seq);

    int markMentionsRead(@Param("conversationId") Long conversationId,
                         @Param("userId") Long userId,
                         @Param("seq") Long seq);
}
