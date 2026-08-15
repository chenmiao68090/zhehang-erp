package com.zhehang.erp.modules.im.controller;

import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.service.ImMessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/im")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "私人消息及会话内容")
public class ImController {
    private final ImMessagingService messagingService;

    @GetMapping("/summary")
    public R<ImModels.UnreadSummary> summary() {
        return R.ok(messagingService.unreadSummary());
    }

    @GetMapping("/contacts")
    public R<List<ImModels.Contact>> contacts(@RequestParam(required = false) String keyword,
                                               @RequestParam(defaultValue = "50") int limit) {
        return R.ok(messagingService.searchContacts(keyword, limit));
    }

    @GetMapping("/conversations")
    public R<ImModels.CursorPage<ImModels.Conversation>> conversations(
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "40") int pageSize) {
        return R.ok(messagingService.listConversations(filter, keyword, cursor, pageSize));
    }

    @GetMapping("/conversations/{id}")
    public R<ImModels.Conversation> conversation(@PathVariable Long id) {
        return R.ok(messagingService.conversationById(id));
    }

    @PostMapping("/conversations/direct")
    @Log(module = "内部消息", type = Log.OperationType.INSERT)
    public R<ImModels.Conversation> createDirect(@Valid @RequestBody ImModels.CreateDirectRequest request) {
        return R.ok(messagingService.createDirect(request.getUserId()));
    }

    @PostMapping("/conversations/group")
    @Log(module = "内部消息", type = Log.OperationType.INSERT)
    public R<ImModels.Conversation> createGroup(@Valid @RequestBody ImModels.CreateGroupRequest request) {
        return R.ok(messagingService.createGroup(request.getName(), request.getMemberIds()));
    }

    @GetMapping("/conversations/{id}/members")
    public R<List<ImModels.Contact>> members(@PathVariable Long id) {
        return R.ok(messagingService.conversationMembers(id));
    }

    @PostMapping("/conversations/{id}/members")
    @Log(module = "内部消息", type = Log.OperationType.UPDATE)
    public R<Void> addMembers(@PathVariable Long id, @RequestBody ImModels.AddMembersRequest request) {
        messagingService.addMembers(id, request.getUserIds());
        return R.ok();
    }

    @PostMapping("/conversations/{id}/leave")
    @Log(module = "内部消息", type = Log.OperationType.UPDATE)
    public R<Void> leave(@PathVariable Long id) {
        messagingService.leaveConversation(id);
        return R.ok();
    }

    @PutMapping("/conversations/{id}/settings")
    public R<Void> memberSettings(@PathVariable Long id, @RequestBody ImModels.MemberSettingRequest request) {
        messagingService.updateMemberSetting(id, request);
        return R.ok();
    }

    @GetMapping("/conversations/{id}/messages")
    public R<ImModels.CursorPage<ImModels.Message>> messages(
            @PathVariable Long id,
            @RequestParam(required = false) Long beforeSeq,
            @RequestParam(required = false) Long afterSeq,
            @RequestParam(defaultValue = "50") int pageSize) {
        return R.ok(messagingService.listMessages(id, beforeSeq, afterSeq, pageSize));
    }

    @GetMapping("/conversations/{id}/messages/search")
    public R<ImModels.CursorPage<ImModels.Message>> searchMessages(
            @PathVariable Long id,
            @RequestParam String keyword,
            @RequestParam(required = false) Long beforeSeq,
            @RequestParam(defaultValue = "50") int pageSize) {
        return R.ok(messagingService.searchMessages(id, keyword, beforeSeq, pageSize));
    }

    @PostMapping("/conversations/{id}/messages")
    public R<ImModels.Message> send(@PathVariable Long id, @Valid @RequestBody ImModels.SendMessageRequest request) {
        return R.ok(messagingService.send(id, request));
    }

    @GetMapping("/messages/{id}")
    public R<ImModels.Message> message(@PathVariable Long id) {
        return R.ok(messagingService.messageById(id));
    }

    @PutMapping("/conversations/{id}/read")
    public R<Void> read(@PathVariable Long id, @Valid @RequestBody ImModels.ReadRequest request) {
        messagingService.markRead(id, request.getSeq());
        return R.ok();
    }

    @PutMapping("/conversations/{id}/delivered")
    public R<Void> delivered(@PathVariable Long id, @Valid @RequestBody ImModels.ReadRequest request) {
        messagingService.markDelivered(id, request.getSeq());
        return R.ok();
    }

    @PutMapping("/messages/{id}")
    @Log(module = "内部消息", type = Log.OperationType.UPDATE)
    public R<ImModels.Message> edit(@PathVariable Long id, @Valid @RequestBody ImModels.EditMessageRequest request) {
        return R.ok(messagingService.editMessage(id, request.getText()));
    }

    @PostMapping("/messages/{id}/recall")
    @Log(module = "内部消息", type = Log.OperationType.UPDATE)
    public R<Void> recall(@PathVariable Long id) {
        messagingService.recallMessage(id);
        return R.ok();
    }

    @PostMapping("/messages/{id}/reaction")
    public R<Map<String, Boolean>> reaction(@PathVariable Long id, @Valid @RequestBody ImModels.ReactionRequest request) {
        return R.ok(Map.of("active", messagingService.toggleReaction(id, request.getReactionCode())));
    }

    @PostMapping("/messages/{id}/favorite")
    public R<Map<String, Boolean>> favorite(@PathVariable Long id) {
        return R.ok(Map.of("active", messagingService.toggleFavorite(id)));
    }

    @PostMapping("/messages/{id}/important")
    public R<Map<String, Boolean>> important(@PathVariable Long id) {
        return R.ok(Map.of("active", messagingService.toggleImportant(id)));
    }

    @GetMapping("/messages/{id}/receipt")
    public R<ImModels.ReadReceipt> receipt(@PathVariable Long id) {
        return R.ok(messagingService.readReceipt(id));
    }

    @GetMapping("/preferences")
    public R<ImEntities.Preference> preference() {
        return R.ok(messagingService.getPreference());
    }

    @PutMapping("/preferences")
    public R<ImEntities.Preference> updatePreference(@RequestBody ImModels.PreferenceRequest request) {
        return R.ok(messagingService.updatePreference(request));
    }
}
