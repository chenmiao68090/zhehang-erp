<template>
  <div class="im-shell" :class="`mobile-${mobilePane}`">
    <aside class="conversation-pane">
      <header class="conversation-head">
        <div class="conversation-title-row">
          <div><h1>内部沟通</h1><p><span :class="imStore.connectionState" />{{ connectionText }}</p></div>
          <div class="conversation-create-actions">
            <el-button circle :icon="Calendar" title="我的待办" @click="openTaskBoard" />
            <el-button circle :icon="User" title="发起单聊" @click="openCreate('direct')" />
            <el-button circle type="primary" :icon="Plus" title="新建群聊" @click="openCreate('group')" />
          </div>
        </div>
        <el-input v-model="conversationKeyword" clearable :prefix-icon="Search" placeholder="搜索员工、群聊、消息或业务编号" @input="scheduleConversationSearch" />
        <div class="filter-strip">
          <button v-for="item in primaryFilters" :key="item.key" type="button" :class="{ active: activeFilter === item.key }" @click="changeFilter(item.key)">
            {{ item.label }}<sup v-if="item.key === 'unread' && imStore.summary.unreadConversations">{{ imStore.summary.unreadConversations }}</sup>
          </button>
          <el-dropdown trigger="click" @command="changeFilter">
            <button type="button" class="more-filter" :class="{ active: !primaryFilters.some(i => i.key === activeFilter) }"><el-icon><Filter /></el-icon></button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="item in moreFilters" :key="item.key" :command="item.key" :class="{ 'is-selected': activeFilter === item.key }">{{ item.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div ref="conversationListRef" class="conversation-list" @scroll="onConversationScroll">
        <div v-if="conversationKeyword.trim() && quickContacts.length" class="quick-contact-results">
          <h3>联系人</h3>
          <button v-for="contact in quickContacts" :key="contact.userId" type="button" @click="startDirectFromSearch(contact)">
            <span class="quick-contact-avatar"><el-avatar :size="34" :src="contact.avatar">{{ contact.name.slice(0, 1) }}</el-avatar><i class="presence-dot" :class="{ online: contact.online }" /></span>
            <span class="quick-contact-copy"><b>{{ contact.name }}</b><small>{{ contact.deptName || contact.empCode }}</small></span>
            <small class="quick-contact-presence" :class="{ online: contact.online }">{{ presenceText(contact.online, contact.lastActiveAt, true) }}</small>
            <el-icon><ChatDotRound /></el-icon>
          </button>
          <h3>会话与消息</h3>
        </div>
        <article
          v-for="conversation in conversations"
          :key="conversation.id"
          class="conversation-row"
          :class="{ active: activeConversation?.id === conversation.id, unread: conversation.unreadCount || conversation.manualUnreadSeq, pinned: conversation.pinned }"
          @click="selectConversation(conversation)"
        >
          <span class="conversation-avatar-wrap">
            <el-avatar :size="44" :src="conversation.avatarUrl">{{ conversation.name?.slice(0, 1) || '消' }}</el-avatar>
            <i v-if="conversation.type === 'direct'" class="presence-dot" :class="{ online: conversation.peerOnline }" />
          </span>
          <span class="conversation-copy">
            <span class="conversation-name-line">
              <b>{{ conversation.name }}</b>
              <el-icon v-if="conversation.pinned" title="已置顶"><Top /></el-icon>
              <time>{{ formatConversationTime(conversation.lastMessageAt) }}</time>
            </span>
            <span class="conversation-preview-line">
              <em v-if="conversation.draft">[草稿] {{ conversation.draft }}</em>
              <span v-else>{{ conversation.lastMessageText || '开始一段工作沟通' }}</span>
              <small v-if="conversation.type === 'direct'" class="conversation-presence" :class="{ online: conversation.peerOnline }">{{ presenceText(conversation.peerOnline, conversation.peerLastActiveAt, true) }}</small>
              <el-icon v-if="conversation.muted" title="免打扰"><MuteNotification /></el-icon>
              <i v-if="conversation.mentionCount">@我</i>
              <u v-if="conversation.unreadCount || conversation.manualUnreadSeq">{{ conversation.unreadCount > 99 ? '99+' : Math.max(1, conversation.unreadCount) }}</u>
            </span>
            <span v-if="conversation.businessType" class="business-chip">{{ businessName(conversation.businessType) }}</span>
          </span>
          <el-dropdown trigger="click" class="conversation-menu" @command="command => handleConversationCommand(command, conversation)" @click.stop>
            <button type="button" title="会话操作"><el-icon><MoreFilled /></el-icon></button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="pin" :icon="Top">{{ conversation.pinned ? '取消置顶' : '置顶会话' }}</el-dropdown-item>
                <el-dropdown-item command="read" :icon="CircleCheck">{{ conversation.unreadCount ? '标记已读' : '标记未读' }}</el-dropdown-item>
                <el-dropdown-item command="mute" :icon="MuteNotification">{{ conversation.muted ? '关闭免打扰' : '消息免打扰' }}</el-dropdown-item>
                <el-dropdown-item command="hide" :icon="Hide">隐藏会话</el-dropdown-item>
                <el-dropdown-item v-if="conversation.canLeave" divided command="leave" :icon="SwitchButton">退出群聊</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </article>
        <div v-if="conversationLoading" class="list-loading"><el-icon class="is-loading"><Loading /></el-icon>加载会话</div>
        <el-empty v-else-if="!conversations.length" :image-size="72" description="没有找到会话" />
      </div>
    </aside>

    <main class="chat-pane">
      <template v-if="activeConversation">
        <header class="chat-head">
          <button class="mobile-back" type="button" title="返回会话列表" @click="backToConversationList"><el-icon><ArrowLeft /></el-icon></button>
          <span class="chat-avatar-wrap"><el-avatar :size="40" :src="activeConversation.avatarUrl">{{ activeConversation.name?.slice(0, 1) }}</el-avatar><i v-if="activeConversation.type === 'direct'" class="presence-dot" :class="{ online: peerOnline }" /></span>
          <div class="chat-head-copy">
            <h2>{{ activeConversation.name }}</h2>
            <p>
              <span v-if="conversationReadOnly">系统自动通知</span>
              <span v-else-if="activeConversation.type === 'direct'" class="chat-presence" :class="{ online: peerOnline }">{{ peerPresenceText }}</span>
              <span v-else>{{ activeConversation.memberCount }} 名成员</span>
              <el-tag v-if="activeConversation.businessType" size="small" effect="plain">{{ businessName(activeConversation.businessType) }} #{{ activeConversation.businessId }}</el-tag>
            </p>
          </div>
          <div class="chat-head-actions">
            <el-button text :icon="Search" title="搜索聊天记录" @click="openMessageSearch" />
            <el-button text :icon="CircleCheck" title="把最新消息转为待办" :disabled="!latestTaskSource" @click="openTaskCreate(latestTaskSource)" />
            <el-button text :icon="Top" :class="{ active: activeConversation.pinned }" title="置顶" @click="updateConversationSetting('pinned', !activeConversation.pinned)" />
            <el-button text :icon="MuteNotification" :class="{ active: activeConversation.muted }" title="免打扰" @click="updateConversationSetting('muted', !activeConversation.muted)" />
            <el-button text :icon="More" title="会话详情" @click="detailsDrawer = true" />
          </div>
        </header>

        <section ref="messageScroller" class="message-scroller" @scroll="onMessageScroll" @dragover.prevent @drop.prevent="onDropFiles">
          <div class="message-list">
            <button v-if="hasEarlierMessages" class="load-earlier" type="button" :disabled="messageLoading" @click="loadEarlierMessages">
              <el-icon v-if="messageLoading" class="is-loading"><Loading /></el-icon>{{ messageLoading ? '正在加载' : '加载更早消息' }}
            </button>
            <div v-else-if="messages.length" class="history-start">已到达当前可见记录起点</div>

            <div v-if="messageLoading && !messages.length" class="message-state">
              <el-icon class="is-loading"><Loading /></el-icon>
              <b>正在加载消息</b>
            </div>
            <div v-else-if="messageLoadError && !messages.length" class="message-state error">
              <el-icon><Warning /></el-icon>
              <b>消息加载失败</b>
              <p>{{ messageLoadError }}</p>
              <el-button type="primary" plain :icon="Refresh" @click="retryActiveConversation">重新加载</el-button>
            </div>
            <div v-else-if="!messages.length" class="message-state empty">
              <el-icon><ChatDotRound /></el-icon>
              <b>{{ conversationReadOnly ? '暂无系统通知' : '还没有消息' }}</b>
              <el-button text :icon="Refresh" @click="retryActiveConversation">刷新</el-button>
            </div>

            <template v-for="(message, index) in messages" :key="`${message.conversationId}:${message.clientMessageId || message.id}`">
              <div v-if="showDateDivider(index)" class="date-divider"><span>{{ formatMessageDate(message.createdAt) }}</span></div>
              <div v-if="showUnreadDivider(message, index)" class="unread-divider"><span>以下是未读消息</span></div>
              <article :id="`im-message-${message.id}`" :data-message-seq="message.id > 0 ? message.seq : undefined" class="message-row" :class="{ mine: isMine(message), recalled: message.recalled, highlighted: highlightedMessageId === message.id }" @contextmenu.prevent="openMessageContextMenu($event, message)">
                <el-avatar :size="34" :src="message.senderAvatar">{{ message.senderName?.slice(0, 1) }}</el-avatar>
                <div class="message-column">
                  <div class="message-meta"><b>{{ message.senderName }}</b><time>{{ formatMessageTime(message.createdAt) }}</time></div>
                  <div class="message-bubble" :class="message.messageType">
                    <div v-if="message.forwardedFrom" class="forward-source">
                      <el-icon><Share /></el-icon><span>转发自 {{ message.forwardedFrom.senderName }} · {{ message.forwardedFrom.conversationName }}</span>
                    </div>
                    <button v-if="message.replyTo" type="button" class="reply-quote" @click="jumpToMessage(message.replyTo.id)">
                      <b>{{ message.replyTo.senderName }}</b><span>{{ message.replyTo.text }}</span>
                    </button>
                    <p v-if="(message.text || message.recalled) && !['task', 'business'].includes(message.messageType)" class="message-text">{{ message.text }}</p>
                    <TaskCard
                      v-if="message.task"
                      :task="message.task"
                      @open="openTaskDetail"
                      @accept="acceptTask"
                      @submit="openTaskSubmit"
                      @review="openTaskReview"
                    />
                    <BusinessCard v-if="message.business" :card="message.business" :message-text="message.text" @open="openBusinessAction" />
                    <div v-if="message.attachments?.length" class="attachment-grid">
                      <template v-for="attachment in message.attachments" :key="attachment.id">
                        <button v-if="attachment.image" class="image-attachment" type="button" @click="previewImage(attachment)">
                          <img v-if="attachmentUrls[attachment.id]" :src="attachmentUrls[attachment.id]" :alt="attachment.originalName" loading="lazy" />
                          <span v-else><el-icon class="is-loading"><Loading /></el-icon></span>
                        </button>
                        <button v-else class="file-attachment" type="button" @click="downloadAttachment(attachment)">
                          <span class="file-type"><el-icon><Document /></el-icon></span>
                          <span><b>{{ attachment.originalName }}</b><small>{{ formatBytes(attachment.fileSize) }}</small></span>
                          <el-icon><Download /></el-icon>
                        </button>
                      </template>
                    </div>
                    <small v-if="message.edited && !message.recalled" class="edited-label">已编辑</small>
                  </div>
                  <div v-if="message.reactions?.length" class="reaction-list">
                    <button v-for="reaction in message.reactions" :key="reaction.code" type="button" :class="{ active: reaction.reactedByMe }" :title="reaction.userNames.join('、')" @click="toggleReaction(message, reaction.code)">
                      {{ reactionIcon(reaction.code) }} <span>{{ reaction.count }}</span>
                    </button>
                  </div>
                  <div v-if="isMine(message) && message.status !== 'recalled'" class="delivery-status">
                    <button v-if="message.status === 'failed'" type="button" class="failed" @click="retryMessage(message)"><el-icon><Warning /></el-icon>发送失败，点击重试</button>
                    <span v-else-if="message.status === 'sending'"><el-icon class="is-loading"><Loading /></el-icon>发送中</span>
                    <button v-else type="button" :class="{ read: isMessageRead(message) }" :disabled="message.id <= 0 || message.readCount + message.unreadCount === 0" @click="showReceipt(message)">{{ deliveryLabel(message) }}</button>
                  </div>
                  <div v-if="!message.recalled" class="message-actions">
                    <el-button text :icon="ChatLineSquare" title="回复" @click="replyMessage = message" />
                    <el-button text :icon="CopyDocument" title="复制" @click="copyMessage(message)" />
                    <el-button text :icon="Share" title="转发" @click="openForward(message)" />
                    <el-dropdown trigger="click" @command="command => handleMessageCommand(command, message)">
                      <el-button text :icon="MoreFilled" title="更多操作" />
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="reaction">添加回应</el-dropdown-item>
                          <el-dropdown-item command="favorite">{{ message.favorite ? '取消收藏' : '收藏' }}</el-dropdown-item>
                          <el-dropdown-item command="important">{{ message.important ? '取消重要' : '标记重要' }}</el-dropdown-item>
                          <el-dropdown-item v-if="message.messageType !== 'task'" command="task">转为待办</el-dropdown-item>
                          <el-dropdown-item v-if="isMine(message)" command="edit">编辑</el-dropdown-item>
                          <el-dropdown-item v-if="isMine(message)" command="recall">撤回</el-dropdown-item>
                          <el-dropdown-item v-if="isMine(message)" command="receipt">查看已读人员</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </article>
            </template>
          </div>

          <button v-if="newMessageCount" class="new-message-float" type="button" @click="scrollToBottom(true)">
            <el-icon><ArrowDown /></el-icon>{{ newMessageCount }} 条新消息
          </button>
        </section>

        <section v-if="!conversationReadOnly" class="composer" :class="{ dragging: composerDragging }" @dragenter.prevent="composerDragging = true" @dragleave.prevent="composerDragging = false" @dragover.prevent @drop.prevent="onDropFiles">
          <div v-if="imStore.connectionState === 'offline' || imStore.connectionState === 'reconnecting'" class="offline-notice">
            <el-icon><Connection /></el-icon>{{ imStore.connectionState === 'offline' ? '网络已断开，草稿已保留' : '正在恢复实时连接，发送仍会通过接口重试' }}
          </div>
          <div v-if="replyMessage" class="composer-reply">
            <span><b>回复 {{ replyMessage.senderName }}</b><small>{{ replyMessage.text }}</small></span>
            <el-button text :icon="Close" title="取消回复" @click="replyMessage = null" />
          </div>
          <div v-if="uploadQueue.length" class="upload-queue">
            <div v-for="item in uploadQueue" :key="item.key" :class="item.status">
              <span class="upload-file-icon"><el-icon><component :is="item.file.type.startsWith('image/') ? Picture : Document" /></el-icon></span>
              <span><b>{{ item.file.name }}</b><small>{{ item.status === 'failed' ? item.error : item.status === 'done' ? '上传完成' : `上传中 ${item.progress}%` }}</small></span>
              <el-progress v-if="item.status === 'uploading'" :percentage="item.progress" :show-text="false" />
              <el-button v-if="item.status === 'failed'" text :icon="Refresh" title="重试上传" @click="uploadOne(item)" />
              <el-button text :icon="Close" title="移除附件" @click="removeUpload(item.key)" />
            </div>
          </div>
          <div class="composer-toolbar">
            <el-popover v-model:visible="emojiVisible" placement="top-start" :width="260" trigger="click">
              <template #reference><el-button text :icon="Sunny" title="表情" /></template>
              <div class="emoji-grid"><button v-for="emoji in emojis" :key="emoji" type="button" @click="insertEmoji(emoji)">{{ emoji }}</button></div>
            </el-popover>
            <el-button text :icon="Picture" title="发送图片" @click="openFilePicker('image')" />
            <el-button text :icon="Paperclip" title="发送文件" @click="openFilePicker('file')" />
            <el-button text class="at-button" title="@成员" @click="openMentionPicker">@</el-button>
          </div>
          <div class="composer-main">
            <el-input
              ref="composerInput"
              v-model="draftText"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 7 }"
              resize="none"
              placeholder="输入工作消息，Enter 发送，Shift+Enter 换行"
              @keydown="onComposerKeydown"
              @paste="onPaste"
            />
            <el-button type="primary" :disabled="!canSend" :loading="sending" @click="sendMessage">发送</el-button>
          </div>
          <div v-if="mentionPickerVisible" class="mention-picker">
            <header><b>选择群成员</b><el-input v-model="mentionKeyword" size="small" clearable placeholder="姓名、部门或工号" /></header>
            <button v-if="activeConversation.canMentionAll" type="button" @click="insertMention(null)"><span class="mention-all">@</span><span><b>所有人</b><small>提醒当前会话全部成员</small></span></button>
            <button v-for="member in filteredMentionMembers" :key="member.userId" type="button" @click="insertMention(member)">
              <el-avatar :size="30" :src="member.avatar">{{ member.name.slice(0, 1) }}</el-avatar><span><b>{{ member.name }}</b><small>{{ member.deptName || member.empCode }}</small></span>
            </button>
          </div>
          <input ref="imageInput" hidden type="file" accept="image/*" multiple @change="onFileInput" />
          <input ref="fileInput" hidden type="file" multiple @change="onFileInput" />
        </section>
        <section v-else class="conversation-readonly"><el-icon><Lock /></el-icon><span>系统通知</span><small>仅供查看</small></section>
      </template>

      <div v-else class="chat-empty">
        <div class="chat-empty-icon"><el-icon><ChatDotRound /></el-icon></div>
        <h2>选择一条会话开始沟通</h2>
        <p>业务沟通、阅读确认和工作记录都会保存在公司系统中</p>
        <el-button type="primary" :icon="User" @click="openCreate('direct')">发起消息</el-button>
      </div>
    </main>

    <aside v-if="activeConversation" class="details-pane">
      <ConversationDetails
        :conversation="activeConversation"
        :members="members"
        :files="conversationFiles"
        :preference="imStore.preference"
        @setting="updateConversationSetting"
        @preference="updatePreference"
        @add-members="openAddMembers"
        @leave="leaveConversation(activeConversation)"
        @download="downloadAttachment"
      />
    </aside>

    <el-drawer v-model="detailsDrawer" class="im-detail-drawer" size="320px" title="会话详情" append-to-body>
      <ConversationDetails
        v-if="activeConversation"
        :conversation="activeConversation"
        :members="members"
        :files="conversationFiles"
        :preference="imStore.preference"
        @setting="updateConversationSetting"
        @preference="updatePreference"
        @add-members="openAddMembers"
        @leave="leaveConversation(activeConversation)"
        @download="downloadAttachment"
      />
    </el-drawer>

    <el-dialog v-model="createDialog.visible" :title="createDialog.mode === 'direct' ? '发起单聊' : '新建群聊'" width="520px" append-to-body>
      <el-form v-if="createDialog.mode === 'group'" label-position="top">
        <el-form-item label="群聊名称"><el-input v-model="createDialog.name" maxlength="120" show-word-limit placeholder="例如：7月审单异常协作群" /></el-form-item>
      </el-form>
      <el-input v-model="contactKeyword" clearable :prefix-icon="Search" placeholder="搜索姓名、部门或员工编号" @input="loadContacts" />
      <div class="contact-picker">
        <button v-for="contact in contacts" :key="contact.userId" type="button" :class="{ selected: createDialog.selected.includes(contact.userId) }" @click="toggleContact(contact)">
          <span class="avatar-wrap"><el-avatar :size="38" :src="contact.avatar">{{ contact.name.slice(0, 1) }}</el-avatar><i class="presence-dot" :class="{ online: contact.online }" /></span>
          <span><b>{{ contact.name }}</b><small>{{ contact.deptName || '未设置部门' }}<template v-if="contact.empCode"> · {{ contact.empCode }}</template></small></span>
          <small class="contact-presence" :class="{ online: contact.online }">{{ presenceText(contact.online, contact.lastActiveAt, true) }}</small>
          <el-icon v-if="createDialog.selected.includes(contact.userId)" class="selected-icon"><CircleCheckFilled /></el-icon>
        </button>
      </div>
      <template #footer>
        <el-button @click="createDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="createDialog.loading" :disabled="!createDialog.selected.length || (createDialog.mode === 'group' && !createDialog.name.trim())" @click="submitCreate">
          {{ createDialog.mode === 'direct' ? '进入会话' : `创建群聊${createDialog.selected.length ? `（${createDialog.selected.length + 1}人）` : ''}` }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addMemberDialog" title="添加群成员" width="500px" append-to-body>
      <el-input v-model="contactKeyword" clearable :prefix-icon="Search" placeholder="搜索员工" @input="loadContacts" />
      <div class="contact-picker compact">
        <button v-for="contact in availableAddMembers" :key="contact.userId" type="button" :class="{ selected: addMemberSelected.includes(contact.userId) }" @click="toggleAddMember(contact.userId)">
          <span class="avatar-wrap"><el-avatar :size="36" :src="contact.avatar">{{ contact.name.slice(0, 1) }}</el-avatar><i class="presence-dot" :class="{ online: contact.online }" /></span><span><b>{{ contact.name }}</b><small>{{ contact.deptName }}</small></span><small class="contact-presence" :class="{ online: contact.online }">{{ presenceText(contact.online, contact.lastActiveAt, true) }}</small><el-icon v-if="addMemberSelected.includes(contact.userId)"><CircleCheckFilled /></el-icon>
        </button>
      </div>
      <template #footer><el-button @click="addMemberDialog = false">取消</el-button><el-button type="primary" :disabled="!addMemberSelected.length" @click="submitAddMembers">添加</el-button></template>
    </el-dialog>

    <el-drawer v-model="messageSearch.visible" title="搜索聊天记录" size="420px" append-to-body>
      <el-input v-model="messageSearch.keyword" clearable :prefix-icon="Search" placeholder="输入消息内容" @keyup.enter="searchInConversation" />
      <el-button class="search-submit" type="primary" :loading="messageSearch.loading" @click="searchInConversation">搜索</el-button>
      <div class="search-result-list">
        <button v-for="result in messageSearch.results" :key="result.id" type="button" @click="openSearchResult(result)">
          <span><b>{{ result.senderName }}</b><time>{{ formatMessageDate(result.createdAt) }}</time></span><p>{{ result.text }}</p>
        </button>
        <el-empty v-if="messageSearch.searched && !messageSearch.results.length" :image-size="64" description="未找到相关消息" />
      </div>
    </el-drawer>

    <el-dialog v-model="receiptDialog.visible" title="消息阅读情况" width="520px" append-to-body>
      <el-tabs>
        <el-tab-pane :label="`已读 ${receiptDialog.data?.readCount || 0}`">
          <div class="receipt-users"><span v-for="user in receiptDialog.data?.readUsers || []" :key="user.userId"><el-avatar :size="32" :src="user.avatar">{{ user.name.slice(0, 1) }}</el-avatar>{{ user.name }}</span></div>
        </el-tab-pane>
        <el-tab-pane :label="`未读 ${receiptDialog.data?.unreadCount || 0}`">
          <div class="receipt-users"><span v-for="user in receiptDialog.data?.unreadUsers || []" :key="user.userId"><el-avatar :size="32" :src="user.avatar">{{ user.name.slice(0, 1) }}</el-avatar>{{ user.name }}</span></div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <el-dialog v-model="forwardDialog.visible" title="转发消息" width="480px" append-to-body>
      <el-input v-model="forwardDialog.keyword" clearable :prefix-icon="Search" placeholder="搜索目标会话" />
      <div class="forward-list">
        <button v-for="conversation in forwardTargets" :key="conversation.id" type="button" :class="{ selected: forwardDialog.targetId === conversation.id }" @click="forwardDialog.targetId = conversation.id">
          <el-avatar :size="36" :src="conversation.avatarUrl">{{ conversation.name.slice(0, 1) }}</el-avatar><span>{{ conversation.name }}</span><el-icon v-if="forwardDialog.targetId === conversation.id"><CircleCheckFilled /></el-icon>
        </button>
      </div>
      <template #footer><el-button @click="forwardDialog.visible = false">取消</el-button><el-button type="primary" :disabled="!forwardDialog.targetId" @click="submitForward">转发</el-button></template>
    </el-dialog>

    <el-dialog v-model="taskCreate.visible" title="转为工作待办" width="720px" class="task-create-dialog" append-to-body destroy-on-close>
      <div v-if="taskCreate.source" class="task-source-preview">
        <span>来源消息</span><b>{{ taskCreate.source.senderName }}</b><p>{{ taskCreate.source.text || `[${taskCreate.source.messageType}]` }}</p>
      </div>
      <el-form label-position="top">
        <el-form-item label="待办标题" required>
          <el-input v-model="taskCreate.title" maxlength="200" show-word-limit placeholder="用一句话说明需要完成什么" />
        </el-form-item>
        <div class="task-form-grid">
          <el-form-item label="责任人" required>
            <el-select v-model="taskCreate.responsibleIds" multiple filterable collapse-tags :max-collapse-tags="2" placeholder="选择一人或多人">
              <el-option v-for="member in members" :key="member.userId" :label="`${member.name}${member.deptName ? ` · ${member.deptName}` : ''}`" :value="member.userId" />
            </el-select>
          </el-form-item>
          <el-form-item label="协同人">
            <el-select v-model="taskCreate.collaboratorIds" multiple filterable collapse-tags :max-collapse-tags="2" placeholder="选填">
              <el-option v-for="member in members" :key="member.userId" :label="`${member.name}${member.deptName ? ` · ${member.deptName}` : ''}`" :value="member.userId" :disabled="taskCreate.responsibleIds.includes(member.userId)" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属部门">
            <el-select v-model="taskCreate.deptId" clearable placeholder="按责任人自动带出">
              <el-option v-for="dept in taskDepartmentOptions" :key="dept.id" :label="dept.name" :value="dept.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级" required>
            <el-radio-group v-model="taskCreate.priority">
              <el-radio-button value="urgent">紧急</el-radio-button>
              <el-radio-button value="important">重要</el-radio-button>
              <el-radio-button value="normal">普通</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="截止时间" required>
            <el-date-picker v-model="taskCreate.deadlineAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" placeholder="选择截止时间" :disabled-date="disablePastDate" />
          </el-form-item>
          <el-form-item label="提醒规则">
            <el-checkbox-group v-model="taskCreate.reminderRules" class="reminder-options">
              <el-checkbox value="before_2h">提前2小时</el-checkbox>
              <el-checkbox value="due">到期提醒</el-checkbox>
              <el-checkbox value="overdue_1h">逾期升级</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        <el-form-item label="关联业务（选填）">
          <div class="business-form-row">
            <el-select v-model="taskCreate.businessType" clearable placeholder="业务类型">
              <el-option v-for="item in businessTypes" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input-number v-model="taskCreate.businessId" :min="1" :controls="false" placeholder="业务ID" />
            <el-input-number v-model="taskCreate.customerId" :min="1" :controls="false" placeholder="客户ID" />
          </div>
        </el-form-item>
        <el-form-item label="验收标准" required>
          <el-input v-model="taskCreate.acceptanceStandard" type="textarea" :rows="3" maxlength="5000" show-word-limit placeholder="写清完成结果、凭证或可验收的标准" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskCreate.visible = false">取消</el-button>
        <el-button type="primary" :loading="taskCreate.loading" :disabled="!canCreateTask" @click="submitTaskCreate">创建并发送待办</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="issueCreate.visible" title="下发任务工单" width="560px" append-to-body destroy-on-close>
      <div v-if="issueCreate.source" class="task-source-preview">
        <span>来源消息</span><b>{{ issueCreate.source.senderName }}</b><p>{{ issueCreate.source.text || `[${issueCreate.source.messageType}]` }}</p>
      </div>
      <el-form label-position="top">
        <el-form-item label="任务内容" required>
          <el-input v-model="issueCreate.description" type="textarea" :rows="3" maxlength="500" show-word-limit placeholder="写清要完成什么、交付或验收标准" />
        </el-form-item>
        <el-form-item label="主办人" required>
          <el-select v-model="issueCreate.ownerId" filterable placeholder="选择主办人" style="width:100%">
            <el-option v-for="s in issueStaffCandidates" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <div class="issue-form-row">
          <el-form-item label="截止时间" required>
            <el-date-picker v-model="issueCreate.deadline" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm" placeholder="选择截止时间" :disabled-date="disablePastDate" style="width:100%" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="issueCreate.priority" style="width:100%">
              <el-option label="P0 紧急" value="P0" />
              <el-option label="P1 普通" value="P1" />
              <el-option label="P2 低" value="P2" />
            </el-select>
          </el-form-item>
        </div>
        <el-form-item label="关联客户（选填）">
          <el-input v-model="issueCreate.customerName" placeholder="客户名称，可留空" maxlength="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueCreate.visible = false">取消</el-button>
        <el-button type="primary" :loading="issueCreate.loading" :disabled="!canCreateIssue" @click="submitIssueCreate">下发工单</el-button>
      </template>
    </el-dialog>

    <div v-if="messageCtx.visible" class="message-ctx" :style="{ left: messageCtx.x + 'px', top: messageCtx.y + 'px' }" @click.stop>
      <button type="button" @click="replyFromContext"><i data-lucide="reply"></i>回复</button>
      <button type="button" @click="forwardFromContext"><i data-lucide="send"></i>转发</button>
      <button v-if="messageCtx.message && messageCtx.message.messageType !== 'task'" type="button" @click="taskFromContext"><i data-lucide="check-square"></i>转为待办</button>
      <div class="ctx-sep"></div>
      <button v-if="messageCtx.message && messageCtx.message.messageType !== 'task'" type="button" class="ctx-issue" @click="issueFromContext"><i data-lucide="clipboard-list"></i>下发任务工单</button>
      <button type="button" @click="favoriteFromContext"><i data-lucide="star"></i>{{ messageCtx.message?.favorite ? '取消收藏' : '收藏' }}</button>
      <button type="button" @click="importantFromContext"><i data-lucide="bell"></i>{{ messageCtx.message?.important ? '取消重要' : '标记重要' }}</button>
      <button type="button" @click="copyFromContext"><i data-lucide="copy"></i>复制</button>
      <button v-if="messageCtx.message && isMine(messageCtx.message)" type="button" @click="editFromContext"><i data-lucide="pencil"></i>编辑</button>
      <button v-if="messageCtx.message && isMine(messageCtx.message)" type="button" @click="recallFromContext"><i data-lucide="rotate-ccw"></i>撤回</button>
      <button v-if="messageCtx.message && messageCtx.message.id > 0" type="button" @click="receiptFromContext"><i data-lucide="eye"></i>查看已读</button>
    </div>

    <el-drawer v-model="taskBoard.visible" title="工作待办" size="min(680px, 100vw)" class="task-board-drawer" append-to-body>
      <div class="task-board-toolbar">
        <el-radio-group v-model="taskBoard.scope" size="small" @change="loadTaskBoard(true)">
          <el-radio-button v-for="scope in taskScopeOptions" :key="scope.value" :value="scope.value">{{ scope.label }}</el-radio-button>
        </el-radio-group>
        <el-select v-model="taskBoard.state" size="small" @change="loadTaskBoard(true)">
          <el-option v-for="state in taskStateOptions" :key="state.value" :label="state.label" :value="state.value" />
        </el-select>
      </div>
      <div class="task-stats-strip">
        <span><b>{{ taskBoard.stats.pendingAccept }}</b>待接收</span>
        <span><b>{{ taskBoard.stats.inProgress }}</b>进行中</span>
        <span><b>{{ taskBoard.stats.pendingReview }}</b>待验收</span>
        <span class="danger"><b>{{ taskBoard.stats.overdue }}</b>已逾期</span>
      </div>
      <div class="task-board-list">
        <TaskCard
          v-for="task in taskBoard.items"
          :key="task.taskId"
          :task="task"
          @open="openTaskDetail"
          @accept="acceptTask"
          @submit="openTaskSubmit"
          @review="openTaskReview"
        />
        <el-empty v-if="!taskBoard.loading && !taskBoard.items.length" :image-size="76" description="当前范围没有待办" />
        <el-button v-if="taskBoard.hasMore" text :loading="taskBoard.loading" @click="loadTaskBoard(false)">加载更多</el-button>
      </div>
    </el-drawer>

    <el-drawer v-model="taskDetail.visible" title="待办详情" size="min(640px, 100vw)" class="task-detail-drawer" append-to-body>
      <TaskDetailPanel
        :task="taskDetail.data"
        @source="openTaskSource"
        @download="downloadAttachment"
        @accept="acceptTask"
        @submit="openTaskSubmit"
        @review="openTaskReview"
        @cancel="cancelTask"
      />
    </el-drawer>

    <el-dialog v-model="taskSubmit.visible" title="提交完成结果" width="600px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="处理结果" required>
          <el-input v-model="taskSubmit.result" type="textarea" :rows="5" maxlength="10000" show-word-limit placeholder="说明完成内容、处理结论和需要验收人关注的事项" />
        </el-form-item>
        <el-form-item label="处理凭证">
          <el-button :icon="Paperclip" @click="taskSubmitFileInput?.click()">上传图片或文件</el-button>
          <input ref="taskSubmitFileInput" hidden type="file" multiple @change="onTaskSubmitFiles" />
          <div v-if="taskSubmit.uploads.length" class="task-evidence-upload">
            <div v-for="item in taskSubmit.uploads" :key="item.key">
              <span><b>{{ item.file.name }}</b><small>{{ item.status === 'failed' ? item.error : item.status === 'done' ? '上传完成' : `上传中 ${item.progress}%` }}</small></span>
              <el-progress v-if="item.status === 'uploading'" :percentage="item.progress" :show-text="false" />
              <el-button v-if="item.status === 'failed'" text :icon="Refresh" @click="uploadTaskEvidence(item)" />
              <el-button text :icon="Close" @click="removeTaskEvidence(item.key)" />
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskSubmit.visible = false">取消</el-button>
        <el-button type="primary" :loading="taskSubmit.loading" :disabled="!canSubmitTaskResult" @click="submitTaskResult">提交验收</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="taskReview.visible" title="待办验收" width="560px" append-to-body>
      <el-form label-position="top">
        <el-form-item label="验收结论" required>
          <el-radio-group v-model="taskReview.pass"><el-radio-button :value="true">验收通过</el-radio-button><el-radio-button :value="false">驳回重做</el-radio-button></el-radio-group>
        </el-form-item>
        <el-form-item :label="taskReview.pass ? '验收意见' : '驳回原因'" :required="!taskReview.pass">
          <el-input v-model="taskReview.comment" type="textarea" :rows="4" maxlength="1000" show-word-limit :placeholder="taskReview.pass ? '选填，可补充验收结论' : '必须说明不符合哪项标准以及修改要求'" />
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="taskReview.visible = false">取消</el-button><el-button :type="taskReview.pass ? 'success' : 'danger'" :loading="taskReview.loading" :disabled="!taskReview.pass && !taskReview.comment.trim()" @click="submitTaskReview">确认提交</el-button></template>
    </el-dialog>

    <el-image-viewer v-if="imagePreview.visible && imagePreview.url" :url-list="[imagePreview.url]" :hide-on-click-modal="true" @close="closeImagePreview" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown, ArrowLeft, Calendar, ChatDotRound, ChatLineSquare, CircleCheck, CircleCheckFilled, Close, Connection,
  CopyDocument, Document, Download, Filter, Hide, Loading, More, MoreFilled, MuteNotification, Paperclip,
  Lock, Picture, Plus, Refresh, Search, Share, Sunny, SwitchButton, Top, User, Warning, ClipboardList
} from '@element-plus/icons-vue'
import { customerIssueApi, staffCandidatesApi } from '@/api/customer-issue'
import {
  imApi, type ImAttachment, type ImContact, type ImConversation, type ImCreateTaskRequest,
  type ImMessage, type ImTaskStats, type ImWorkTask
} from '@/api/im'
import { useImStore } from '@/stores/im'
import { useUserStore } from '@/stores/user'
import { mergeImMessages as mergeMessages } from '@/utils/im-message-merge'
import { formatImPresence } from '@/utils/im-presence'
import ConversationDetails from '@/components/im/ConversationDetails.vue'
import BusinessCard from '@/components/im/BusinessCard.vue'
import TaskCard from '@/components/im/TaskCard.vue'
import TaskDetailPanel from '@/components/im/TaskDetailPanel.vue'

type UploadItem = { key: string; file: File; progress: number; status: 'uploading' | 'done' | 'failed'; attachment?: ImAttachment; error?: string }
type PresenceState = { online: boolean; lastActiveAt?: string }

const route = useRoute()
const router = useRouter()
const imStore = useImStore()
const userStore = useUserStore()

const conversations = ref<ImConversation[]>([])
const activeConversation = ref<ImConversation | null>(null)
const members = ref<ImContact[]>([])
const messages = ref<ImMessage[]>([])
const conversationCursor = ref<string>()
const conversationHasMore = ref(false)
const conversationLoading = ref(false)
const messageLoading = ref(false)
const messageLoadError = ref('')
const hasEarlierMessages = ref(false)
const activeFilter = ref(String(route.query.filter || 'all'))
const conversationKeyword = ref('')
const quickContacts = ref<ImContact[]>([])
const initialLastReadSeq = ref(0)
const highlightedMessageId = ref<number>()
const newMessageCount = ref(0)
const mobilePane = ref<'list' | 'chat'>('list')
const detailsDrawer = ref(false)
const peerContact = computed(() => members.value.find(member => Number(member.userId) === Number(activeConversation.value?.peerUserId)))
const peerOnline = computed(() => activeConversation.value?.type === 'direct'
  && Boolean(peerContact.value?.online ?? activeConversation.value?.peerOnline))
const peerLastActiveAt = computed(() => peerContact.value?.lastActiveAt || activeConversation.value?.peerLastActiveAt)
const peerPresenceText = computed(() => presenceText(peerOnline.value, peerLastActiveAt.value))
const conversationReadOnly = computed(() => activeConversation.value?.type === 'system')
const conversationListRef = ref<HTMLElement>()
const messageScroller = ref<HTMLElement>()
const composerInput = ref<any>()
const imageInput = ref<HTMLInputElement>()
const fileInput = ref<HTMLInputElement>()
const taskSubmitFileInput = ref<HTMLInputElement>()

const draftText = ref('')
const sending = ref(false)
const replyMessage = ref<ImMessage | null>(null)
const selectedMentions = ref<ImContact[]>([])
const mentionAll = ref(false)
const mentionPickerVisible = ref(false)
const mentionKeyword = ref('')
const emojiVisible = ref(false)
const composerDragging = ref(false)
const uploadQueue = ref<UploadItem[]>([])
const failedPayloads = new Map<string, Record<string, unknown>>()
const presenceByUser = new Map<number, PresenceState>()
const attachmentUrls = reactive<Record<number, string>>({})
let conversationSearchTimer: number | undefined
let draftSaveTimer: number | undefined
let missingMessageTimer: number | undefined
let conversationRefreshTimer: number | undefined
let visibleReadTimer: number | undefined
let readReportInFlight = false
let pendingReadSeq = 0
let pendingReadConversationId = 0
let suppressDraftPersistence = false
let conversationLoadVersion = 0

const primaryFilters = [
  { key: 'all', label: '全部' }, { key: 'unread', label: '未读' }, { key: 'mention', label: '@我' }, { key: 'important', label: '重要' }
]
const moreFilters = [
  { key: 'todo', label: '待办消息' }, { key: 'direct', label: '单聊' }, { key: 'group', label: '群聊' },
  { key: 'department', label: '部门群' }, { key: 'business', label: '业务群' }, { key: 'announcement', label: '公告' }, { key: 'system', label: '系统通知' }
]
const emojis = ['😀', '😄', '👍', '👌', '🙏', '🎉', '✅', '📌', '💪', '👀', '❤️', '🤝', '⚠️', '🔥', '💡', '📣']
const canSend = computed(() => !conversationReadOnly.value && !sending.value && !uploadQueue.value.some(item => item.status === 'uploading') && (draftText.value.trim() || uploadQueue.value.some(item => item.status === 'done')))
const filteredMentionMembers = computed(() => {
  const keyword = mentionKeyword.value.trim().toLowerCase()
  return members.value.filter(member => member.userId !== Number(userStore.userInfo?.id)).filter(member => !keyword || `${member.name} ${member.deptName || ''} ${member.empCode || ''}`.toLowerCase().includes(keyword))
})
const conversationFiles = computed(() => {
  const seen = new Set<number>()
  return messages.value.flatMap(message => message.attachments || []).filter(file => !seen.has(file.id) && seen.add(file.id)).slice().reverse()
})
const latestTaskSource = computed(() => [...messages.value].reverse().find(message => message.id > 0 && !message.recalled && message.messageType !== 'task') || null)
const taskDepartmentOptions = computed(() => {
  const map = new Map<number, string>()
  members.value.forEach(member => { if (member.deptId && member.deptName) map.set(member.deptId, member.deptName) })
  return Array.from(map, ([id, name]) => ({ id, name }))
})
const connectionText = computed(() => ({ connected: '实时在线', connecting: '正在连接', reconnecting: '正在重连', offline: '离线', idle: '准备连接' }[imStore.connectionState]))

const createDialog = reactive({ visible: false, mode: 'direct' as 'direct' | 'group', name: '', selected: [] as number[], loading: false })
const contacts = ref<ImContact[]>([])
const contactKeyword = ref('')
const addMemberDialog = ref(false)
const addMemberSelected = ref<number[]>([])
const availableAddMembers = computed(() => contacts.value.filter(contact => !members.value.some(member => member.userId === contact.userId)))
const messageSearch = reactive({ visible: false, keyword: '', results: [] as ImMessage[], loading: false, searched: false })
const receiptDialog = reactive<{ visible: boolean; data: any }>({ visible: false, data: null })
const forwardDialog = reactive({ visible: false, message: null as ImMessage | null, targetId: 0, keyword: '' })
const forwardTargets = computed(() => conversations.value.filter(c => c.id !== forwardDialog.message?.conversationId && (!forwardDialog.keyword || c.name.includes(forwardDialog.keyword))))
const imagePreview = reactive({ visible: false, url: '', name: '' })
const emptyTaskStats = (): ImTaskStats => ({ pendingAccept: 0, inProgress: 0, pendingReview: 0, completed: 0, rejected: 0, overdue: 0 })
const taskCreate = reactive({
  visible: false, source: null as ImMessage | null, title: '', responsibleIds: [] as number[], collaboratorIds: [] as number[],
  deptId: undefined as number | undefined, priority: 'normal' as 'urgent' | 'important' | 'normal', deadlineAt: '',
  reminderRules: ['before_2h', 'due', 'overdue_1h'] as string[], customerId: undefined as number | undefined,
  businessType: '' as string, businessId: undefined as number | undefined, acceptanceStandard: '', loading: false
})
const messageCtx = reactive({
  visible: false, x: 0, y: 0, message: null as ImMessage | null
})
const issueCreate = reactive({
  visible: false, source: null as ImMessage | null, description: '', ownerId: undefined as number | undefined,
  deadline: '', priority: 'P2', customerName: '', loading: false
})
const issueStaffCandidates = ref<Array<{ id: number; name: string }>>([])
const canCreateIssue = computed(() => Boolean(issueCreate.source?.id && issueCreate.description.trim() && issueCreate.ownerId && issueCreate.deadline))
const taskBoard = reactive({
  visible: false, scope: 'all_mine', state: 'all', items: [] as ImWorkTask[], cursor: undefined as string | undefined,
  hasMore: false, loading: false, stats: emptyTaskStats()
})
const taskDetail = reactive<{ visible: boolean; data: ImWorkTask | null }>({ visible: false, data: null })
const taskSubmit = reactive({ visible: false, task: null as ImWorkTask | null, result: '', uploads: [] as UploadItem[], loading: false })
const taskReview = reactive({ visible: false, task: null as ImWorkTask | null, pass: true, comment: '', loading: false })
const canCreateTask = computed(() => Boolean(taskCreate.source?.id && taskCreate.title.trim() && taskCreate.responsibleIds.length && taskCreate.deadlineAt && taskCreate.acceptanceStandard.trim()))
const canSubmitTaskResult = computed(() => Boolean(taskSubmit.result.trim() && !taskSubmit.uploads.some(item => item.status === 'uploading') && !taskSubmit.loading))
const taskScopeOptions = computed(() => {
  const options = [
    { value: 'all_mine', label: '与我相关' }, { value: 'responsible', label: '我负责' },
    { value: 'created', label: '我创建' }, { value: 'participating', label: '我参与' }
  ]
  const roles = userStore.roles || []
  if (roles.some(role => ['manager', 'dept_manager'].includes(role))) options.push({ value: 'department', label: '本部门' })
  if (roles.some(role => ['admin', 'super_admin', 'boss'].includes(role)) || Number(userStore.userInfo?.id) === 1) options.push({ value: 'company', label: '全公司' })
  return options
})
const taskStateOptions = [
  { value: 'all', label: '全部状态' }, { value: 'pending_accept', label: '待接收' }, { value: 'in_progress', label: '进行中' },
  { value: 'pending_review', label: '待验收' }, { value: 'overdue', label: '已逾期' }, { value: 'rejected', label: '已驳回' },
  { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }
]
const businessTypes = [
  { value: 'customer', label: '客户' }, { value: 'lead', label: '线索' }, { value: 'order', label: '提单' },
  { value: 'review', label: '审单' }, { value: 'receipt', label: '收款' }, { value: 'contract', label: '合同' },
  { value: 'issue', label: '客户问题' }, { value: 'training', label: '培训' }
]

onMounted(async () => {
  await imStore.initialize()
  await loadConversations(true)
  const requested = Number(route.query.conversationId)
  if (requested) {
    const found = conversations.value.find(c => c.id === requested)
    if (found) await selectConversation(found)
    else {
      try { const { data } = await imApi.conversation(requested); await selectConversation(data) } catch { /* 已由接口提示 */ }
    }
  }
  window.addEventListener('zhehang-im-event', handleRealtimeEvent as EventListener)
  window.addEventListener('focus', scheduleVisibleRead)
  document.addEventListener('visibilitychange', scheduleVisibleRead)
  document.addEventListener('click', closeMessageContextMenu)
  missingMessageTimer = window.setInterval(() => {
    if (imStore.connectionState !== 'connected') void syncMissingMessages().catch(() => {})
  }, 10000)
})

onBeforeUnmount(() => {
  window.removeEventListener('zhehang-im-event', handleRealtimeEvent as EventListener)
  window.removeEventListener('focus', scheduleVisibleRead)
  document.removeEventListener('visibilitychange', scheduleVisibleRead)
  document.removeEventListener('click', closeMessageContextMenu)
  if (conversationSearchTimer) window.clearTimeout(conversationSearchTimer)
  if (draftSaveTimer) window.clearTimeout(draftSaveTimer)
  if (missingMessageTimer) window.clearInterval(missingMessageTimer)
  if (conversationRefreshTimer) window.clearTimeout(conversationRefreshTimer)
  if (visibleReadTimer) window.clearTimeout(visibleReadTimer)
  Object.values(attachmentUrls).forEach(url => URL.revokeObjectURL(url))
  if (imagePreview.url) URL.revokeObjectURL(imagePreview.url)
})

watch(draftText, () => {
  if (!activeConversation.value || suppressDraftPersistence) return
  if (draftSaveTimer) window.clearTimeout(draftSaveTimer)
  draftSaveTimer = window.setTimeout(saveDraft, 800)
  const tail = draftText.value.slice(0, composerInput.value?.textarea?.selectionStart || draftText.value.length)
  const match = tail.match(/(?:^|\s)@([^\s@]*)$/)
  if (match) { mentionKeyword.value = match[1] || ''; mentionPickerVisible.value = true }
})

watch(() => route.query.filter, value => {
  const next = String(value || 'all')
  if (next !== activeFilter.value) { activeFilter.value = next; loadConversations(true) }
})

watch(() => [...taskCreate.responsibleIds], ids => {
  taskCreate.collaboratorIds = taskCreate.collaboratorIds.filter(id => !ids.includes(id))
  const first = members.value.find(member => member.userId === ids[0])
  if (first?.deptId) taskCreate.deptId = first.deptId
})

async function loadConversations(reset = false) {
  if (conversationLoading.value || (!reset && !conversationHasMore.value)) return
  conversationLoading.value = true
  try {
    if (reset) conversationCursor.value = undefined
    const { data } = await imApi.conversations({ filter: activeFilter.value, keyword: conversationKeyword.value.trim() || undefined, cursor: conversationCursor.value, pageSize: 40 })
    const items = data.items.map(withKnownConversationPresence)
    conversations.value = reset ? items : mergeConversations(conversations.value, items)
    if (reset && activeConversation.value) {
      const refreshedActive = conversations.value.find(item => item.id === activeConversation.value?.id)
      if (refreshedActive) activeConversation.value = { ...activeConversation.value, ...refreshedActive }
    }
    conversationCursor.value = data.nextCursor
    conversationHasMore.value = data.hasMore
  } finally { conversationLoading.value = false }
}

function mergeConversations(base: ImConversation[], incoming: ImConversation[]) {
  const map = new Map(base.map(item => [item.id, item]))
  incoming.forEach(item => map.set(item.id, item))
  return Array.from(map.values())
}

function scheduleConversationSearch() {
  if (conversationSearchTimer) window.clearTimeout(conversationSearchTimer)
  conversationSearchTimer = window.setTimeout(async () => {
    await loadConversations(true)
    if (conversationKeyword.value.trim()) {
      try { quickContacts.value = (await imApi.contacts({ keyword: conversationKeyword.value.trim(), limit: 8 })).data.map(withKnownContactPresence) } catch { quickContacts.value = [] }
    } else quickContacts.value = []
  }, 320)
}

async function startDirectFromSearch(contact: ImContact) {
  const { data } = await imApi.createDirect(contact.userId)
  conversationKeyword.value = ''; quickContacts.value = []
  await loadConversations(true); await selectConversation(data)
}

function changeFilter(filter: string) {
  activeFilter.value = filter
  router.replace({ query: { ...route.query, filter: filter === 'all' ? undefined : filter } })
  loadConversations(true)
}

function onConversationScroll() {
  const el = conversationListRef.value
  if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) loadConversations(false)
}

async function selectConversation(conversation: ImConversation) {
  conversation = withKnownConversationPresence(conversation)
  if (activeConversation.value?.id === conversation.id) {
    mobilePane.value = 'chat'
    if (!messages.value.length && !messageLoading.value) await retryActiveConversation()
    return
  }
  const loadVersion = ++conversationLoadVersion
  activeConversation.value = { ...conversation }
  mobilePane.value = 'chat'
  initialLastReadSeq.value = conversation.lastReadSeq || 0
  draftText.value = conversation.draft || ''
  replyMessage.value = null
  selectedMentions.value = []
  mentionAll.value = false
  messages.value = []
  members.value = []
  hasEarlierMessages.value = false
  messageLoadError.value = ''
  newMessageCount.value = 0
  router.replace({ query: { ...route.query, conversationId: String(conversation.id) } })
  await Promise.allSettled([
    loadInitialMessages(conversation.id, loadVersion),
    loadMembers(conversation.id, loadVersion)
  ])
}

function backToConversationList() {
  mobilePane.value = 'list'
  router.replace({ query: { ...route.query, conversationId: undefined } })
}

async function retryActiveConversation() {
  const conversationId = activeConversation.value?.id
  if (!conversationId || messageLoading.value) return
  const loadVersion = ++conversationLoadVersion
  messageLoadError.value = ''
  await Promise.allSettled([
    loadInitialMessages(conversationId, loadVersion),
    loadMembers(conversationId, loadVersion)
  ])
  scheduleConversationRefresh()
}

async function loadInitialMessages(conversationId: number, loadVersion: number) {
  messageLoading.value = true
  messageLoadError.value = ''
  try {
    const { data } = await imApi.messages(conversationId, { pageSize: 50 })
    if (!isCurrentConversationLoad(conversationId, loadVersion)) return
    messages.value = mergeMessages(data.items.map(normalizeMine))
    hasEarlierMessages.value = data.hasMore
    await nextTick()
    await hydrateAttachmentUrls(messages.value)
    const firstUnread = messages.value.find(message => message.seq > initialLastReadSeq.value && !isMine(message))
    if (firstUnread) jumpToMessage(firstUnread.id, false)
    else scrollToBottom(false)
    await markVisibleRead(conversationId)
    if (!messages.value.length) scheduleConversationRefresh()
  } catch {
    if (isCurrentConversationLoad(conversationId, loadVersion)) {
      messageLoadError.value = '暂时无法取得消息记录，请稍后重试'
    }
  } finally {
    if (isCurrentConversationLoad(conversationId, loadVersion)) messageLoading.value = false
  }
}

async function loadEarlierMessages() {
  if (!activeConversation.value || !messages.value.length || messageLoading.value) return
  const conversationId = activeConversation.value.id
  const loadVersion = conversationLoadVersion
  const scroller = messageScroller.value
  const previousHeight = scroller?.scrollHeight || 0
  const before = messages.value[0].seq
  messageLoading.value = true
  try {
    const { data } = await imApi.messages(conversationId, { beforeSeq: before, pageSize: 50 })
    if (!isCurrentConversationLoad(conversationId, loadVersion)) return
    messages.value = mergeMessages(data.items.map(normalizeMine), messages.value)
    hasEarlierMessages.value = data.hasMore
    await nextTick()
    if (scroller) scroller.scrollTop += scroller.scrollHeight - previousHeight
    hydrateAttachmentUrls(data.items)
  } finally {
    if (isCurrentConversationLoad(conversationId, loadVersion)) messageLoading.value = false
  }
}

async function syncMissingMessages() {
  if (!activeConversation.value) return
  const conversationId = activeConversation.value.id
  const loadVersion = conversationLoadVersion
  const lastSeq = messages.value.at(-1)?.seq || 0
  const { data } = await imApi.messages(conversationId, { afterSeq: lastSeq, pageSize: 100 })
  if (!isCurrentConversationLoad(conversationId, loadVersion)) return
  if (data.items.length) {
    const atBottom = isNearBottom()
    messages.value = mergeMessages(messages.value, data.items.map(normalizeMine))
    await nextTick(); hydrateAttachmentUrls(data.items)
    if (atBottom) { scrollToBottom(false); markVisibleRead() } else newMessageCount.value += data.items.length
  }
}

async function reloadLatestMessages() {
  if (!activeConversation.value) return
  const conversationId = activeConversation.value.id
  const loadVersion = conversationLoadVersion
  const { data } = await imApi.messages(conversationId, { pageSize: 50 })
  if (!isCurrentConversationLoad(conversationId, loadVersion)) return
  messages.value = mergeMessages(messages.value, data.items.map(normalizeMine))
  hydrateAttachmentUrls(data.items)
}

async function loadMembers(conversationId = activeConversation.value?.id, loadVersion = conversationLoadVersion) {
  if (!conversationId) return
  try {
    const { data } = await imApi.members(conversationId)
    if (isCurrentConversationLoad(conversationId, loadVersion)) members.value = data.map(withKnownContactPresence)
  } catch {
    if (isCurrentConversationLoad(conversationId, loadVersion)) members.value = []
  }
}

async function markVisibleRead(conversationId = activeConversation.value?.id) {
  if (!conversationId || activeConversation.value?.id !== conversationId || !messages.value.length) return
  if (document.visibilityState !== 'visible' || !document.hasFocus()) return
  const seq = highestVisibleMessageSeq()
  if (!seq) return
  if (seq <= (activeConversation.value.lastReadSeq || 0) && !activeConversation.value.manualUnreadSeq) return
  if (pendingReadConversationId !== conversationId) pendingReadSeq = 0
  pendingReadConversationId = conversationId
  pendingReadSeq = Math.max(pendingReadSeq, seq)
  if (readReportInFlight) return
  readReportInFlight = true
  try {
    while (pendingReadSeq > 0 && pendingReadConversationId === conversationId) {
      const targetSeq = pendingReadSeq
      pendingReadSeq = 0
      await imApi.read(conversationId, targetSeq)
      if (activeConversation.value?.id !== conversationId) return
      activeConversation.value.lastReadSeq = Math.max(activeConversation.value.lastReadSeq || 0, targetSeq)
      activeConversation.value.manualUnreadSeq = 0
      const reachedLatest = targetSeq >= activeConversation.value.lastSeq
      if (reachedLatest) {
        activeConversation.value.unreadCount = 0
        activeConversation.value.mentionCount = 0
      }
      const row = conversations.value.find(c => c.id === conversationId)
      if (row) Object.assign(row, {
        lastReadSeq: activeConversation.value.lastReadSeq,
        manualUnreadSeq: 0,
        unreadCount: reachedLatest ? 0 : row.unreadCount,
        mentionCount: reachedLatest ? 0 : row.mentionCount
      })
      imStore.refreshSummary()
      scheduleConversationRefresh()
    }
  } finally {
    readReportInFlight = false
    if (pendingReadSeq > 0) scheduleVisibleRead()
  }
}

function highestVisibleMessageSeq() {
  const scroller = messageScroller.value
  if (!scroller) return 0
  const viewport = scroller.getBoundingClientRect()
  let highest = 0
  scroller.querySelectorAll<HTMLElement>('.message-row[data-message-seq]').forEach(row => {
    const rect = row.getBoundingClientRect()
    if (rect.bottom > viewport.top && rect.top < viewport.bottom) {
      highest = Math.max(highest, Number(row.dataset.messageSeq || 0))
    }
  })
  return highest
}

function scheduleVisibleRead() {
  if (visibleReadTimer) window.clearTimeout(visibleReadTimer)
  visibleReadTimer = window.setTimeout(() => void markVisibleRead(), 120)
}

function isCurrentConversationLoad(conversationId: number, loadVersion: number) {
  return activeConversation.value?.id === conversationId && conversationLoadVersion === loadVersion
}

function scheduleConversationRefresh() {
  if (conversationRefreshTimer) window.clearTimeout(conversationRefreshTimer)
  conversationRefreshTimer = window.setTimeout(() => {
    if (conversationLoading.value) {
      scheduleConversationRefresh()
      return
    }
    void loadConversations(true).catch(() => {})
  }, 120)
}

function onMessageScroll() {
  if (isNearBottom()) newMessageCount.value = 0
  scheduleVisibleRead()
}

function isNearBottom() {
  const el = messageScroller.value
  return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 90
}

function scrollToBottom(smooth: boolean) {
  nextTick(() => messageScroller.value?.scrollTo({ top: messageScroller.value.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }))
  newMessageCount.value = 0
}

function jumpToMessage(id: number, highlight = true) {
  nextTick(() => {
    document.getElementById(`im-message-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    if (highlight) { highlightedMessageId.value = id; window.setTimeout(() => highlightedMessageId.value = undefined, 1600) }
  })
}

function showDateDivider(index: number) {
  if (index === 0) return true
  return new Date(messages.value[index].createdAt).toDateString() !== new Date(messages.value[index - 1].createdAt).toDateString()
}

function showUnreadDivider(message: ImMessage, index: number) {
  if (isMine(message) || message.seq <= initialLastReadSeq.value) return false
  return !messages.value.slice(0, index).some(item => !isMine(item) && item.seq > initialLastReadSeq.value)
}

function openCreate(mode: 'direct' | 'group') {
  createDialog.mode = mode; createDialog.name = ''; createDialog.selected = []; createDialog.visible = true; contactKeyword.value = ''; loadContacts()
}

async function loadContacts() {
  const { data } = await imApi.contacts({ keyword: contactKeyword.value || undefined, limit: 100 })
  contacts.value = data.map(withKnownContactPresence)
}

function toggleContact(contact: ImContact) {
  if (createDialog.mode === 'direct') createDialog.selected = [contact.userId]
  else createDialog.selected = createDialog.selected.includes(contact.userId) ? createDialog.selected.filter(id => id !== contact.userId) : [...createDialog.selected, contact.userId]
}

async function submitCreate() {
  createDialog.loading = true
  try {
    const response = createDialog.mode === 'direct'
      ? await imApi.createDirect(createDialog.selected[0])
      : await imApi.createGroup({ name: createDialog.name.trim(), memberIds: createDialog.selected })
    createDialog.visible = false
    await loadConversations(true)
    await selectConversation(response.data)
  } finally { createDialog.loading = false }
}

function openAddMembers() { addMemberSelected.value = []; contactKeyword.value = ''; addMemberDialog.value = true; loadContacts() }
function toggleAddMember(id: number) { addMemberSelected.value = addMemberSelected.value.includes(id) ? addMemberSelected.value.filter(item => item !== id) : [...addMemberSelected.value, id] }
async function submitAddMembers() {
  if (!activeConversation.value) return
  await imApi.addMembers(activeConversation.value.id, addMemberSelected.value)
  ElMessage.success('成员已加入群聊')
  addMemberDialog.value = false
  await loadMembers()
}

async function handleConversationCommand(command: string, conversation: ImConversation) {
  if (command === 'pin') await setConversation(conversation, 'pinned', !conversation.pinned)
  if (command === 'mute') await setConversation(conversation, 'muted', !conversation.muted)
  if (command === 'hide') await setConversation(conversation, 'hidden', true)
  if (command === 'read') {
    if (conversation.unreadCount || conversation.manualUnreadSeq) await imApi.read(conversation.id, conversation.lastSeq)
    else await setConversation(conversation, 'manualUnread', true)
  }
  if (command === 'leave') await leaveConversation(conversation)
  await loadConversations(true)
}

async function setConversation(conversation: ImConversation, key: string, value: unknown) {
  await imApi.settings(conversation.id, { [key]: value })
  if (key in conversation) (conversation as any)[key] = value
}

async function updateConversationSetting(key: string, value: unknown) {
  if (!activeConversation.value) return
  if (key === 'hidden') return setConversation(activeConversation.value, key, value)
  await setConversation(activeConversation.value, key, value)
  const row = conversations.value.find(c => c.id === activeConversation.value?.id)
  if (row && key in row) (row as any)[key] = value
}

async function updatePreference(key: 'browserNotification' | 'soundEnabled' | 'desktopEnabled', value: boolean) {
  if (key === 'browserNotification' && value && 'Notification' in window && Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') { ElMessage.warning('浏览器通知未获授权'); return }
  }
  await imStore.savePreference({ [key]: value })
}

async function leaveConversation(conversation: ImConversation) {
  await ElMessageBox.confirm(`确定退出「${conversation.name}」吗？历史消息仍会保留。`, '退出群聊', { type: 'warning' })
  await imApi.leave(conversation.id)
  if (activeConversation.value?.id === conversation.id) { activeConversation.value = null; messages.value = []; mobilePane.value = 'list' }
  await loadConversations(true)
}

function openFilePicker(type: 'image' | 'file') { (type === 'image' ? imageInput.value : fileInput.value)?.click() }
function onFileInput(event: Event) { const input = event.target as HTMLInputElement; enqueueFiles(Array.from(input.files || [])); input.value = '' }
function onDropFiles(event: DragEvent) { composerDragging.value = false; enqueueFiles(Array.from(event.dataTransfer?.files || [])) }
function onPaste(event: ClipboardEvent) { const files = Array.from(event.clipboardData?.files || []).filter(file => file.type.startsWith('image/')); if (files.length) { event.preventDefault(); enqueueFiles(files) } }

function enqueueFiles(files: File[]) {
  if (!activeConversation.value) return
  files.slice(0, 10).forEach(file => {
    const item: UploadItem = { key: createClientId(), file, progress: 0, status: 'uploading' }
    uploadQueue.value.push(item); uploadOne(item)
  })
}

async function uploadOne(item: UploadItem) {
  if (!activeConversation.value) return
  item.status = 'uploading'; item.progress = 0; item.error = undefined
  try {
    const { data } = await imApi.uploadAttachment(activeConversation.value.id, item.file, percent => { item.progress = percent })
    item.attachment = data; item.status = 'done'; item.progress = 100
  } catch (error: any) { item.status = 'failed'; item.error = error?.message || '上传失败' }
}

function removeUpload(key: string) { uploadQueue.value = uploadQueue.value.filter(item => item.key !== key) }

function onComposerKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') { mentionPickerVisible.value = false; emojiVisible.value = false; return }
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (mentionPickerVisible.value && filteredMentionMembers.value[0]) insertMention(filteredMentionMembers.value[0]); else sendMessage() }
}

function openMentionPicker() { mentionKeyword.value = ''; mentionPickerVisible.value = true; composerInput.value?.focus() }
function insertMention(member: ImContact | null) {
  const label = member ? member.name : '所有人'
  const textarea = composerInput.value?.textarea as HTMLTextAreaElement | undefined
  const start = textarea?.selectionStart ?? draftText.value.length
  const before = draftText.value.slice(0, start).replace(/@[^\s@]*$/, '')
  const after = draftText.value.slice(start)
  draftText.value = `${before}@${label} ${after}`
  if (member) { if (!selectedMentions.value.some(item => item.userId === member.userId)) selectedMentions.value.push(member) } else mentionAll.value = true
  mentionPickerVisible.value = false
  nextTick(() => composerInput.value?.focus())
}

function insertEmoji(emoji: string) { draftText.value += emoji; emojiVisible.value = false; composerInput.value?.focus() }

async function sendMessage() {
  if (!activeConversation.value || !canSend.value) return
  if (!navigator.onLine) { ElMessage.warning('当前网络已断开，内容已保留为草稿'); return }
  const conversationId = activeConversation.value.id
  const readyAttachments = uploadQueue.value.filter(item => item.status === 'done' && item.attachment)
  const clientMessageId = createClientId()
  const validMentions = selectedMentions.value.filter(member => draftText.value.includes(`@${member.name}`)).map(member => member.userId)
  const type = readyAttachments.length ? (readyAttachments.every(item => item.file.type.startsWith('image/')) ? 'image' : 'file') : 'text'
  const payload: Record<string, unknown> = {
    clientMessageId,
    messageType: type,
    text: draftText.value,
    replyToMessageId: replyMessage.value?.id,
    mentionedUserIds: validMentions,
    mentionAll: mentionAll.value && draftText.value.includes('@所有人'),
    attachmentIds: readyAttachments.map(item => item.attachment!.id)
  }
  failedPayloads.set(clientMessageId, payload)
  const optimistic: ImMessage = {
    id: -Date.now(), conversationId, clientMessageId,
    seq: (messages.value.at(-1)?.seq || activeConversation.value.lastSeq || 0) + 1,
    senderId: Number(userStore.userInfo?.id), senderName: userStore.userInfo?.nickname || userStore.userInfo?.username || '我',
    senderAvatar: userStore.userInfo?.avatar, messageType: type as any, text: draftText.value, status: 'sending', important: false,
    edited: false, recalled: false, createdAt: new Date().toISOString(), mine: true, favorite: false,
    replyTo: replyMessage.value ? { id: replyMessage.value.id, senderId: replyMessage.value.senderId, senderName: replyMessage.value.senderName, text: replyMessage.value.text, status: replyMessage.value.status } : undefined,
    attachments: readyAttachments.map(item => item.attachment!), mentions: [], reactions: [], readCount: 0, deliveredCount: 0, unreadCount: Math.max(0, activeConversation.value.memberCount - 1)
  }
  messages.value = mergeMessages(messages.value, [optimistic])
  suppressDraftPersistence = true
  draftText.value = ''; uploadQueue.value = []; replyMessage.value = null; selectedMentions.value = []; mentionAll.value = false
  scrollToBottom(false)
  sending.value = true
  try {
    const { data } = await imApi.send(conversationId, payload)
    failedPayloads.delete(clientMessageId)
    if (activeConversation.value?.id !== conversationId) return
    replaceOptimistic(clientMessageId, normalizeMine(data))
    activeConversation.value.lastSeq = data.seq
    suppressDraftPersistence = false
    await saveDraft()
    await nextTick(); hydrateAttachmentUrls([data]); scrollToBottom(false)
  } catch (error: any) {
    if (activeConversation.value?.id !== conversationId) return
    const item = messages.value.find(message => message.clientMessageId === clientMessageId)
    if (item) { item.status = 'failed'; item.error = error?.message || '发送失败' }
    suppressDraftPersistence = false
    await saveDraft()
  } finally { suppressDraftPersistence = false; sending.value = false }
}

async function retryMessage(message: ImMessage) {
  if (!activeConversation.value || activeConversation.value.id !== message.conversationId || sending.value) return
  const conversationId = message.conversationId
  const payload = failedPayloads.get(message.clientMessageId)
  if (!payload) { ElMessage.warning('重试信息已失效，请重新发送'); return }
  message.status = 'sending'; sending.value = true
  try {
    const { data } = await imApi.send(conversationId, payload)
    if (activeConversation.value?.id !== conversationId) return
    replaceOptimistic(message.clientMessageId, normalizeMine(data)); failedPayloads.delete(message.clientMessageId)
    await saveDraft()
  } catch (error: any) { message.status = 'failed'; message.error = error?.message || '发送失败' }
  finally { sending.value = false }
}

function replaceOptimistic(clientId: string, message: ImMessage) {
  messages.value = mergeMessages(messages.value, [{ ...message, clientMessageId: clientId }])
}

async function saveDraft() {
  if (!activeConversation.value) return
  await imApi.settings(activeConversation.value.id, { draft: draftText.value }).catch(() => {})
  activeConversation.value.draft = draftText.value
  const row = conversations.value.find(item => item.id === activeConversation.value?.id)
  if (row) row.draft = draftText.value
}

async function handleMessageCommand(command: string, message: ImMessage) {
  if (command === 'reaction') await toggleReaction(message, 'like')
  if (command === 'favorite') { await imApi.favorite(message.id); message.favorite = !message.favorite }
  if (command === 'important') { await imApi.important(message.id); message.important = !message.important }
  if (command === 'task') openTaskCreate(message)
  if (command === 'edit') await editMessage(message)
  if (command === 'recall') await recallMessage(message)
  if (command === 'receipt') await showReceipt(message)
}

async function editMessage(message: ImMessage) {
  const { value } = await ElMessageBox.prompt('修改消息内容', '编辑消息', { inputValue: message.text, inputType: 'textarea', inputValidator: value => value.trim() ? true : '内容不能为空' })
  const { data } = await imApi.edit(message.id, value)
  Object.assign(message, normalizeMine(data))
}

async function recallMessage(message: ImMessage) {
  await ElMessageBox.confirm('撤回后会保留操作记录，群成员将看到撤回提示。', '撤回消息', { type: 'warning' })
  await imApi.recall(message.id)
  Object.assign(message, { status: 'recalled', recalled: true, text: '消息已撤回', attachments: [] })
}

async function toggleReaction(message: ImMessage, code: string) { await imApi.reaction(message.id, code); await reloadLatestMessages() }
async function copyMessage(message: ImMessage) { await navigator.clipboard.writeText(message.text); ElMessage.success('已复制') }

async function showReceipt(message: ImMessage) {
  if (message.id <= 0) return
  const { data } = await imApi.receipt(message.id) as any
  receiptDialog.data = data; receiptDialog.visible = true
}

function isMessageRead(message: ImMessage) {
  return message.readCount > 0 && message.unreadCount === 0
}

function deliveryLabel(message: ImMessage) {
  const total = message.readCount + message.unreadCount
  if (!total) return '已发送'
  if (activeConversation.value?.type === 'direct') return isMessageRead(message) ? '已读' : '未读'
  if (message.unreadCount === 0) return '全部已读'
  return `${message.readCount}/${total}人已读`
}

function openForward(message: ImMessage) { forwardDialog.message = message; forwardDialog.targetId = 0; forwardDialog.keyword = ''; forwardDialog.visible = true }
async function submitForward() {
  if (!forwardDialog.message || !forwardDialog.targetId) return
  await imApi.send(forwardDialog.targetId, { clientMessageId: createClientId(), messageType: 'forward', forwardedMessageId: forwardDialog.message.id, text: forwardDialog.message.text })
  forwardDialog.visible = false; ElMessage.success('已转发')
}

function openTaskCreate(source: ImMessage | null) {
  if (!source || source.id <= 0 || source.recalled) { ElMessage.warning('请先选择一条已发送消息'); return }
  const currentUserId = Number(userStore.userInfo?.id)
  const fallbackResponsible = !isMine(source) && source.senderId > 0
    ? source.senderId
    : activeConversation.value?.peerUserId
  const responsibleIds = fallbackResponsible && fallbackResponsible !== currentUserId ? [fallbackResponsible] : []
  const responsible = members.value.find(member => member.userId === responsibleIds[0])
  taskCreate.source = source
  taskCreate.title = summarizeTaskTitle(source.business?.title || source.text || `${source.senderName}发送的${source.messageType}消息`)
  taskCreate.responsibleIds = responsibleIds
  taskCreate.collaboratorIds = []
  taskCreate.deptId = responsible?.deptId
  taskCreate.priority = 'normal'
  taskCreate.deadlineAt = defaultTaskDeadline()
  taskCreate.reminderRules = ['before_2h', 'due', 'overdue_1h']
  taskCreate.customerId = undefined
  taskCreate.businessType = source.business?.businessType || activeConversation.value?.businessType || ''
  taskCreate.businessId = source.business?.businessId || activeConversation.value?.businessId
  taskCreate.acceptanceStandard = ''
  taskCreate.visible = true
}

async function submitTaskCreate() {
  if (!taskCreate.source || !canCreateTask.value) return
  const payload: ImCreateTaskRequest = {
    title: taskCreate.title.trim(), responsibleIds: taskCreate.responsibleIds,
    collaboratorIds: taskCreate.collaboratorIds.filter(id => !taskCreate.responsibleIds.includes(id)),
    deptId: taskCreate.deptId, priority: taskCreate.priority, deadlineAt: taskCreate.deadlineAt,
    reminderRules: taskCreate.reminderRules, customerId: taskCreate.customerId,
    businessType: taskCreate.businessType || undefined, businessId: taskCreate.businessType ? taskCreate.businessId : undefined,
    acceptanceStandard: taskCreate.acceptanceStandard.trim()
  }
  if (Boolean(payload.businessType) !== Boolean(payload.businessId)) { ElMessage.warning('关联业务类型和业务ID需要同时填写'); return }
  taskCreate.loading = true
  try {
    const { data } = await imApi.createTask(taskCreate.source.id, payload)
    taskCreate.visible = false
    ElMessage.success('待办已创建并通知责任人')
    await Promise.all([reloadLatestMessages(), loadConversations(true)])
    await openTaskDetail(data)
  } finally { taskCreate.loading = false }
}

function openMessageContextMenu(event: MouseEvent, message: ImMessage) {
  event.preventDefault()
  messageCtx.message = message
  messageCtx.x = Math.max(8, Math.min(event.clientX, window.innerWidth - 224))
  messageCtx.y = Math.max(8, Math.min(event.clientY, window.innerHeight - 330))
  messageCtx.visible = true
}

function closeMessageContextMenu() {
  messageCtx.visible = false
  messageCtx.message = null
}

function runContext(action: (message: ImMessage) => void) {
  const message = messageCtx.message
  closeMessageContextMenu()
  if (message) action(message)
}

function replyFromContext() { runContext(m => { replyMessage.value = m }) }
function forwardFromContext() { runContext(openForward) }
function taskFromContext() { runContext(openTaskCreate) }
function issueFromContext() { runContext(openIssueCreate) }
function favoriteFromContext() { runContext(m => handleMessageCommand('favorite', m)) }
function importantFromContext() { runContext(m => handleMessageCommand('important', m)) }
function copyFromContext() { runContext(copyMessage) }
function editFromContext() { runContext(m => handleMessageCommand('edit', m)) }
function recallFromContext() { runContext(m => handleMessageCommand('recall', m)) }
function receiptFromContext() { runContext(m => handleMessageCommand('receipt', m)) }

function openIssueCreate(source: ImMessage | null) {
  if (!source || source.id <= 0 || source.recalled) { ElMessage.warning('请先选择一条有效消息'); return }
  issueCreate.source = source
  issueCreate.description = summarizeTaskTitle(source.business?.title || source.text || `${source.senderName}发送的${source.messageType}消息`)
  issueCreate.ownerId = (!isMine(source) && source.senderId > 0)
    ? source.senderId
    : (activeConversation.value?.peerUserId || undefined)
  issueCreate.deadline = defaultTaskDeadline()
  issueCreate.priority = 'P2'
  issueCreate.customerName = ''
  loadIssueStaffCandidates()
  issueCreate.visible = true
}

async function loadIssueStaffCandidates() {
  // 优先用当前会话成员(消息发送人必在其中,无权限依赖);staff-candidates 仅主管/老板可见,失败时静默兜底
  const fromMembers = members.value.map(member => ({ id: member.userId, name: member.name }))
  try {
    const staff = await staffCandidatesApi()
    const seen = new Set(fromMembers.map(s => s.id))
    const merged = [...fromMembers]
    for (const s of staff) {
      if (!seen.has(s.id)) {
        merged.push({ id: s.id, name: s.name })
        seen.add(s.id)
      }
    }
    issueStaffCandidates.value = merged
  } catch {
    issueStaffCandidates.value = fromMembers
  }
}

async function submitIssueCreate() {
  if (!issueCreate.source || !canCreateIssue.value) return
  issueCreate.loading = true
  try {
    await customerIssueApi.createFromMessage({
      messageId: issueCreate.source.id,
      description: issueCreate.description.trim(),
      ownerId: issueCreate.ownerId as number,
      deadline: issueCreate.deadline,
      priority: issueCreate.priority,
      customerName: issueCreate.customerName.trim() || undefined
    })
    issueCreate.visible = false
    ElMessage.success('任务工单已下发并通知主办人')
    await Promise.all([reloadLatestMessages(), loadConversations(true)])
  } finally { issueCreate.loading = false }
}

async function openTaskBoard() {
  taskBoard.visible = true
  await loadTaskBoard(true)
}

async function loadTaskBoard(reset: boolean) {
  if (taskBoard.loading || (!reset && !taskBoard.hasMore)) return
  taskBoard.loading = true
  try {
    if (reset) taskBoard.cursor = undefined
    const [listResponse, statsResponse] = await Promise.all([
      imApi.tasks({ scope: taskBoard.scope, state: taskBoard.state, cursor: taskBoard.cursor, pageSize: 30 }),
      imApi.taskStats(taskBoard.scope)
    ])
    taskBoard.items = reset ? listResponse.data.items : mergeTasks(taskBoard.items, listResponse.data.items)
    taskBoard.cursor = listResponse.data.nextCursor
    taskBoard.hasMore = listResponse.data.hasMore
    taskBoard.stats = statsResponse.data || emptyTaskStats()
  } finally { taskBoard.loading = false }
}

async function openTaskDetail(task: ImWorkTask) {
  taskDetail.visible = true
  taskDetail.data = task
  try { taskDetail.data = (await imApi.taskDetail(task.taskId)).data } catch { taskDetail.visible = false }
}

async function acceptTask(task: ImWorkTask) {
  const { data } = await imApi.acceptTask(task.taskId)
  replaceTaskEverywhere(data)
  ElMessage.success('已接收，待办进入进行中')
  if (taskBoard.visible) await loadTaskBoard(true)
}

function openTaskSubmit(task: ImWorkTask) {
  taskSubmit.task = task
  taskSubmit.result = ''
  taskSubmit.uploads = []
  taskSubmit.visible = true
}

function onTaskSubmitFiles(event: Event) {
  const input = event.target as HTMLInputElement
  Array.from(input.files || []).slice(0, Math.max(0, 10 - taskSubmit.uploads.length)).forEach(file => {
    const item: UploadItem = { key: createClientId(), file, progress: 0, status: 'uploading' }
    taskSubmit.uploads.push(item)
    uploadTaskEvidence(item)
  })
  input.value = ''
}

async function uploadTaskEvidence(item: UploadItem) {
  if (!taskSubmit.task) return
  item.status = 'uploading'; item.progress = 0; item.error = undefined
  try {
    const { data } = await imApi.uploadTaskAttachment(taskSubmit.task.taskId, item.file, percent => { item.progress = percent })
    item.attachment = data; item.status = 'done'; item.progress = 100
  } catch (error: any) { item.status = 'failed'; item.error = error?.message || '上传失败' }
}

function removeTaskEvidence(key: string) { taskSubmit.uploads = taskSubmit.uploads.filter(item => item.key !== key) }

async function submitTaskResult() {
  if (!taskSubmit.task || !canSubmitTaskResult.value) return
  taskSubmit.loading = true
  try {
    const { data } = await imApi.submitTask(taskSubmit.task.taskId, {
      result: taskSubmit.result.trim(),
      attachmentIds: taskSubmit.uploads.filter(item => item.status === 'done' && item.attachment).map(item => item.attachment!.id)
    })
    taskSubmit.visible = false
    replaceTaskEverywhere(data)
    ElMessage.success('处理结果已提交，等待验收')
    if (taskBoard.visible) await loadTaskBoard(true)
  } finally { taskSubmit.loading = false }
}

function openTaskReview(task: ImWorkTask) {
  taskReview.task = task
  taskReview.pass = true
  taskReview.comment = ''
  taskReview.visible = true
}

async function submitTaskReview() {
  if (!taskReview.task || (!taskReview.pass && !taskReview.comment.trim())) return
  taskReview.loading = true
  try {
    const { data } = await imApi.reviewTask(taskReview.task.taskId, { pass: taskReview.pass, comment: taskReview.comment.trim() || undefined })
    taskReview.visible = false
    replaceTaskEverywhere(data)
    ElMessage.success(taskReview.pass ? '待办已验收完成' : '已驳回责任人重新处理')
    if (taskBoard.visible) await loadTaskBoard(true)
  } finally { taskReview.loading = false }
}

async function cancelTask(task: ImWorkTask) {
  const { value } = await ElMessageBox.prompt('请填写取消原因，操作将保留在时间线中。', '取消待办', {
    inputType: 'textarea', inputValidator: value => value.trim() ? true : '取消原因不能为空',
    confirmButtonText: '确认取消', cancelButtonText: '返回', type: 'warning'
  })
  const { data } = await imApi.cancelTask(task.taskId, value.trim())
  replaceTaskEverywhere(data)
  ElMessage.success('待办已取消')
  if (taskBoard.visible) await loadTaskBoard(true)
}

async function openTaskSource(messageId: number) {
  const task = taskDetail.data
  if (!task) return
  let conversation = conversations.value.find(item => item.id === task.conversationId)
  if (!conversation) conversation = (await imApi.conversation(task.conversationId)).data
  if (activeConversation.value?.id !== conversation.id) await selectConversation(conversation)
  const source = (await imApi.message(messageId)).data
  const { data } = await imApi.messages(conversation.id, { beforeSeq: source.seq + 26, pageSize: 50 })
  messages.value = mergeMessages(data.items.map(normalizeMine))
  hasEarlierMessages.value = data.hasMore
  taskDetail.visible = false
  await nextTick(); hydrateAttachmentUrls(messages.value); jumpToMessage(messageId)
}

function replaceTaskEverywhere(task: ImWorkTask) {
  messages.value.forEach(message => { if (message.task?.taskId === task.taskId) message.task = task })
  const boardIndex = taskBoard.items.findIndex(item => item.taskId === task.taskId)
  if (boardIndex >= 0) taskBoard.items.splice(boardIndex, 1, task)
  if (taskDetail.data?.taskId === task.taskId) taskDetail.data = task
}

function mergeTasks(base: ImWorkTask[], incoming: ImWorkTask[]) {
  const map = new Map(base.map(item => [item.taskId, item]))
  incoming.forEach(item => map.set(item.taskId, item))
  return Array.from(map.values())
}

function summarizeTaskTitle(text: string) {
  const compact = text.replace(/\s+/g, ' ').trim()
  return compact.length > 80 ? `${compact.slice(0, 80)}…` : compact || '处理聊天中的工作事项'
}

function defaultTaskDeadline() {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000)
  date.setSeconds(0, 0)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

function disablePastDate(date: Date) { return date.getTime() < new Date().setHours(0, 0, 0, 0) }

function openBusinessAction(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) { ElMessage.warning('业务入口地址无效'); return }
  router.push(path)
}

function openMessageSearch() { messageSearch.visible = true; messageSearch.keyword = ''; messageSearch.results = []; messageSearch.searched = false }
async function searchInConversation() {
  if (!activeConversation.value || !messageSearch.keyword.trim()) return
  messageSearch.loading = true
  try { const { data } = await imApi.searchMessages(activeConversation.value.id, { keyword: messageSearch.keyword.trim(), pageSize: 50 }); messageSearch.results = mergeMessages(data.items.map(normalizeMine)); messageSearch.searched = true }
  finally { messageSearch.loading = false }
}

async function openSearchResult(message: ImMessage) {
  if (!activeConversation.value) return
  const { data } = await imApi.messages(activeConversation.value.id, { beforeSeq: message.seq + 26, pageSize: 50 })
  messages.value = mergeMessages(data.items.map(normalizeMine)); hasEarlierMessages.value = data.hasMore; messageSearch.visible = false
  await nextTick(); hydrateAttachmentUrls(messages.value); jumpToMessage(message.id)
}

async function hydrateAttachmentUrls(items: ImMessage[]) {
  const imageAttachments = items.flatMap(item => item.attachments || []).filter(item => item.image && !attachmentUrls[item.id])
  await Promise.allSettled(imageAttachments.map(async attachment => {
    const blob = await imApi.attachmentBlob(attachment.id, Boolean(attachment.thumbnailUrl))
    attachmentUrls[attachment.id] = URL.createObjectURL(blob)
  }))
}

async function previewImage(attachment: ImAttachment) {
  const blob = await imApi.attachmentBlob(attachment.id)
  if (imagePreview.url) URL.revokeObjectURL(imagePreview.url)
  imagePreview.url = URL.createObjectURL(blob); imagePreview.name = attachment.originalName; imagePreview.visible = true
}
function closeImagePreview() { imagePreview.visible = false; if (imagePreview.url) URL.revokeObjectURL(imagePreview.url); imagePreview.url = '' }

async function downloadAttachment(attachment: ImAttachment) {
  const blob = await imApi.downloadAttachment(attachment.id)
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = attachment.originalName; anchor.click(); URL.revokeObjectURL(url)
}

function handleRealtimeEvent(event: CustomEvent) {
  const payload = event.detail
  if (!payload?.type) return
  if (payload.type === 'connection.ready') { presenceByUser.clear(); void syncMissingMessages().catch(() => {}); void loadMembers(); scheduleConversationRefresh(); return }
  if (payload.type === 'presence.changed') { applyPresenceUpdate(payload.data); return }
  const conversationId = Number(payload.data?.conversationId || payload.data?.message?.conversationId)
  if (payload.type === 'message.created') {
    const incoming = payload.data?.message as ImMessage
    if (activeConversation.value?.id === conversationId && incoming) {
      const atBottom = isNearBottom(); incoming.mine = isMine(incoming)
      messages.value = mergeMessages(messages.value, [incoming]); nextTick(() => hydrateAttachmentUrls([incoming]))
      if (atBottom) { scrollToBottom(false); if (!incoming.mine) nextTick(scheduleVisibleRead) } else if (!incoming.mine) newMessageCount.value += 1
    }
    scheduleConversationRefresh()
  } else if (activeConversation.value?.id === conversationId && ['message.updated', 'message.recalled', 'receipt.delivered', 'receipt.read', 'task.updated'].includes(payload.type)) reloadLatestMessages()
  if (payload.type === 'task.updated') {
    const taskId = Number(payload.data?.task?.taskId || payload.data?.taskId)
    if (taskDetail.visible && taskDetail.data?.taskId === taskId) imApi.taskDetail(taskId).then(({ data }) => { taskDetail.data = data }).catch(() => {})
    if (taskBoard.visible) loadTaskBoard(true)
  }
  if (['conversation.updated', 'member.joined', 'member.left', 'notification.updated'].includes(payload.type)) { scheduleConversationRefresh(); if (activeConversation.value?.id === conversationId) loadMembers() }
}

function applyPresenceUpdate(data: { userId?: number | string; online?: boolean; lastActiveAt?: string } = {}) {
  const userId = Number(data.userId)
  if (!userId) return
  const online = Boolean(data.online)
  presenceByUser.set(userId, { online, lastActiveAt: data.lastActiveAt })
  contacts.value = contacts.value.map(withKnownContactPresence)
  quickContacts.value = quickContacts.value.map(withKnownContactPresence)
  members.value = members.value.map(withKnownContactPresence)
  conversations.value = conversations.value.map(withKnownConversationPresence)
  if (activeConversation.value) activeConversation.value = withKnownConversationPresence(activeConversation.value)
}

function normalizeMine(message: ImMessage) { return { ...message, mine: isMine(message) } }
function withKnownContactPresence(contact: ImContact) {
  const presence = presenceByUser.get(Number(contact.userId))
  return presence ? { ...contact, online: presence.online, lastActiveAt: presence.lastActiveAt || contact.lastActiveAt } : contact
}
function withKnownConversationPresence(conversation: ImConversation) {
  if (conversation.type !== 'direct' || !conversation.peerUserId) return conversation
  const presence = presenceByUser.get(Number(conversation.peerUserId))
  return presence ? { ...conversation, peerOnline: presence.online, peerLastActiveAt: presence.lastActiveAt || conversation.peerLastActiveAt } : conversation
}
function presenceText(online: boolean, lastActiveAt?: string, compact = false) { return formatImPresence(online, lastActiveAt, compact, new Date(imStore.presenceClock)) }
function isMine(message: ImMessage) { return Number(message.senderId) === Number(userStore.userInfo?.id) }
function createClientId() { return (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/[^A-Za-z0-9._:-]/g, '') }
function businessName(type?: string) { return ({ customer: '客户', lead: '线索', order: '提单', review: '审单', receipt: '收款', contract: '合同', issue: '客户问题', training: '培训', task: '待办' } as Record<string, string>)[type || ''] || type || '业务' }
function reactionIcon(code: string) { return ({ like: '👍', ok: '👌', thanks: '🙏', done: '✅', eyes: '👀', support: '💪' } as Record<string, string>)[code] || '👍' }
function formatConversationTime(value?: string) { if (!value) return ''; const d = new Date(value); const n = new Date(); if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); return `${d.getMonth() + 1}/${d.getDate()}` }
function formatMessageDate(value: string) { const d = new Date(value); const today = new Date(); if (d.toDateString() === today.toDateString()) return '今天'; const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); if (d.toDateString() === yesterday.toDateString()) return '昨天'; return d.toLocaleDateString('zh-CN', { year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric', month: 'long', day: 'numeric' }) }
function formatMessageTime(value: string) { return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) }
function formatBytes(size = 0) { if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`; return `${(size / 1024 / 1024).toFixed(1)} MB` }
</script>

<style scoped lang="scss">
.im-shell { height: 100%; min-height: 0; display: grid; grid-template-columns: 320px minmax(620px, 1fr) 300px; overflow: hidden; border: 1px solid var(--border-color); background: #fff; }
.conversation-pane, .chat-pane, .details-pane { min-width: 0; min-height: 0; }
.conversation-pane { display: flex; flex-direction: column; border-right: 1px solid var(--border-color); background: #fff; }
.conversation-head { flex: 0 0 auto; padding: 17px 14px 10px; border-bottom: 1px solid var(--border-soft); }
.conversation-title-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
.conversation-title-row h1 { margin: 0; font-size: 20px; line-height: 26px; }
.conversation-title-row p { display: flex; align-items: center; gap: 6px; margin: 3px 0 0; color: var(--text-muted); font-size: 12px; }
.conversation-title-row p span { width: 7px; height: 7px; border-radius: 50%; background: #c9cdd4; }
.conversation-title-row p span.connected { background: #00b42a; }
.conversation-title-row p span.connecting, .conversation-title-row p span.reconnecting { background: #ff7d00; }
.conversation-title-row p span.offline { background: #f53f3f; }
.conversation-create-actions { display: flex; gap: 7px; }
.filter-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) 32px; gap: 3px; margin-top: 10px; }
.filter-strip > button, .more-filter { height: 32px; position: relative; border: 0; border-radius: 6px; background: transparent; color: var(--text-muted); font-size: 13px; cursor: pointer; }
.filter-strip > button:hover, .filter-strip > button.active, .more-filter.active, .more-filter:hover { background: #e8f3ff; color: #3370ff; font-weight: 650; }
.filter-strip sup { position: absolute; top: 1px; right: 1px; min-width: 14px; height: 14px; padding: 0 3px; border-radius: 7px; background: #f53f3f; color: #fff; font-size: 9px; line-height: 14px; }
.conversation-list { min-height: 0; flex: 1; overflow-y: auto; padding: 5px 6px 10px; }
.quick-contact-results { padding: 3px 2px 7px; border-bottom: 1px solid var(--border-soft); }
.quick-contact-results h3 { margin: 7px 8px 4px; color: var(--text-muted); font-size: 13px; font-weight: 600; }
.quick-contact-results button { width: 100%; min-height: 50px; display: flex; align-items: center; gap: 9px; padding: 6px 8px; border: 0; border-radius: 6px; background: #fff; color: var(--text-muted); text-align: left; cursor: pointer; }
.quick-contact-results button:hover { background: #f2f7ff; color: #3370ff; }
.quick-contact-avatar { position: relative; flex: 0 0 auto; }
.quick-contact-copy { min-width: 0; flex: 1; display: grid; gap: 2px; }
.quick-contact-presence { flex: 0 0 auto; color: var(--text-muted); font-size: 12px; white-space: nowrap; }
.quick-contact-presence.online { color: #00a82d; }
.quick-contact-results b { color: var(--text-primary); font-size: 15px; }
.quick-contact-results small { color: var(--text-muted); font-size: 13px; }
.conversation-row { position: relative; min-height: 70px; display: flex; align-items: center; gap: 10px; padding: 10px 8px; border-radius: 7px; cursor: pointer; }
.conversation-row:hover { background: #f7f8fa; }
.conversation-row.active { background: #e8f3ff; }
.conversation-row.unread .conversation-name-line b { font-weight: 750; }
.conversation-avatar-wrap { position: relative; flex: 0 0 auto; }
.conversation-avatar-wrap .el-avatar { background: #f2f7ff; color: #3370ff; font-size: 16px; font-weight: 700; }
.presence-dot { position: absolute; right: 0; bottom: 1px; width: 10px; height: 10px; border: 2px solid #fff; border-radius: 50%; background: #c9cdd4; }
.presence-dot.online { background: #00b42a; }
.conversation-copy { min-width: 0; flex: 1; display: grid; gap: 5px; }
.conversation-name-line, .conversation-preview-line { min-width: 0; display: flex; align-items: center; gap: 5px; }
.conversation-name-line b { min-width: 0; flex: 1; overflow: hidden; color: var(--text-primary); font-size: 15px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.conversation-name-line > .el-icon { color: #3370ff; font-size: 12px; }
.conversation-name-line time { color: var(--text-muted); font-size: 12px; }
.conversation-preview-line > span, .conversation-preview-line > em { min-width: 0; flex: 1; overflow: hidden; color: var(--text-muted); font-size: 14px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.conversation-preview-line > em { color: #f53f3f; }
.conversation-presence { flex: 0 0 auto; color: var(--text-muted); font-size: 11px; white-space: nowrap; }
.conversation-presence.online { color: #00a82d; }
.conversation-preview-line > i { color: #f53f3f; font-size: 11px; font-style: normal; white-space: nowrap; }
.conversation-preview-line > u { min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: #f53f3f; color: #fff; font-size: 10px; line-height: 18px; text-align: center; text-decoration: none; }
.business-chip { justify-self: start; padding: 2px 6px; border-radius: 4px; background: #f2f3f5; color: var(--text-muted); font-size: 12px; }
.conversation-menu { position: absolute; top: 35px; right: 4px; opacity: 0; }
.conversation-row:hover .conversation-menu { opacity: 1; }
.conversation-menu button { width: 24px; height: 24px; display: grid; place-items: center; border: 0; border-radius: 5px; background: #fff; color: var(--text-muted); cursor: pointer; }
.list-loading { height: 42px; display: flex; align-items: center; justify-content: center; gap: 7px; color: var(--text-muted); font-size: 12px; }
.chat-pane { display: flex; flex-direction: column; background: #f8f9fb; }
.chat-head { height: 64px; flex: 0 0 auto; display: flex; align-items: center; gap: 10px; padding: 0 16px; border-bottom: 1px solid var(--border-color); background: #fff; }
.chat-avatar-wrap { position: relative; flex: 0 0 auto; }
.chat-avatar-wrap .el-avatar { background: #e8f3ff; color: #3370ff; font-weight: 700; }
.mobile-back { display: none; width: 32px; height: 32px; place-items: center; border: 0; border-radius: 6px; background: transparent; color: var(--text-body); }
.chat-head-copy { min-width: 0; flex: 1; }
.chat-head-copy h2 { margin: 0 0 3px; overflow: hidden; font-size: 18px; line-height: 23px; text-overflow: ellipsis; white-space: nowrap; }
.chat-head-copy p { display: flex; align-items: center; gap: 7px; margin: 0; color: var(--text-muted); font-size: 13px; }
.chat-presence.online { color: #00a82d; }
.chat-head-actions { display: flex; flex: 0 0 auto; }
.chat-head-actions .active { color: #3370ff; background: #e8f3ff; }
.message-scroller { position: relative; min-height: 0; flex: 1; overflow-y: auto; scroll-behavior: auto; }
.message-list { width: 100%; max-width: 980px; min-height: 100%; margin: 0 auto; padding: 16px 24px 24px; }
.message-state { min-height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; padding: 40px 20px; color: var(--text-muted); text-align: center; }
.message-state > .el-icon { font-size: 28px; }
.message-state b { color: var(--text-body); font-size: 15px; }
.message-state p { margin: -2px 0 3px; font-size: 13px; }
.message-state.error > .el-icon { color: #f53f3f; }
.message-state.empty > .el-icon { color: #86909c; }
.load-earlier { display: flex; align-items: center; gap: 6px; margin: 0 auto 12px; padding: 5px 10px; border: 0; border-radius: 6px; background: #eef1f5; color: var(--text-muted); font-size: 12px; cursor: pointer; }
.history-start { margin-bottom: 12px; color: #c0c4cc; font-size: 11px; text-align: center; }
.date-divider, .unread-divider { display: flex; align-items: center; justify-content: center; margin: 14px 0; }
.date-divider span { padding: 3px 9px; border-radius: 6px; background: #eceff3; color: var(--text-muted); font-size: 11px; }
.unread-divider { position: relative; color: #f53f3f; font-size: 11px; }
.unread-divider::before, .unread-divider::after { height: 1px; flex: 1; content: ''; background: #ffd0d0; }
.unread-divider span { padding: 0 10px; }
.message-row { position: relative; display: flex; align-items: flex-start; gap: 10px; margin: 13px 0; content-visibility: auto; contain-intrinsic-size: 80px; }
.message-row > .el-avatar { flex: 0 0 auto; background: #f2f3f5; color: #4e5969; font-size: 13px; }
.message-row.mine { flex-direction: row-reverse; }
.message-column { position: relative; max-width: 68%; display: flex; flex-direction: column; align-items: flex-start; }
.mine .message-column { align-items: flex-end; }
.message-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; color: var(--text-muted); font-size: 12px; }
.mine .message-meta { flex-direction: row-reverse; }
.message-meta b { color: var(--text-body); font-size: 15px; font-weight: 600; }
.message-bubble { position: relative; max-width: 100%; padding: 9px 12px; border: 1px solid #e5e6eb; border-radius: 7px; background: #fff; color: var(--text-primary); box-shadow: 0 1px 2px rgba(31, 35, 41, .04); }
.mine .message-bubble { border-color: #bedaff; background: #e8f3ff; }
.message-bubble.task, .mine .message-bubble.task { padding: 0; border: 0; background: transparent; box-shadow: none; }
.message-row.highlighted .message-bubble { animation: messageHighlight 1.5s ease; }
@keyframes messageHighlight { 0%, 100% { box-shadow: 0 0 0 0 rgba(51,112,255,0); } 35% { box-shadow: 0 0 0 5px rgba(51,112,255,.18); } }
.message-row.recalled .message-bubble { border-style: dashed; background: #f7f8fa; color: var(--text-muted); box-shadow: none; }
.message-text { min-width: 36px; margin: 0; font-size: 15px; line-height: 1.58; overflow-wrap: anywhere; white-space: pre-wrap; }
.forward-source { display: flex; align-items: center; gap: 5px; margin: -2px 0 7px; padding-bottom: 6px; border-bottom: 1px solid rgba(31,35,41,.1); color: var(--text-muted); font-size: 13px; }
.reply-quote { width: 100%; display: grid; gap: 2px; margin-bottom: 7px; padding: 5px 8px; border: 0; border-left: 3px solid #7aa2ff; border-radius: 3px; background: rgba(31,35,41,.05); color: var(--text-muted); text-align: left; cursor: pointer; }
.reply-quote b { color: var(--text-body); font-size: 14px; }
.reply-quote span { max-width: 360px; overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.edited-label { display: block; margin-top: 3px; color: var(--text-muted); font-size: 12px; text-align: right; }
.attachment-grid { display: grid; gap: 7px; margin-top: 7px; }
.image-attachment { width: min(320px, 42vw); min-width: 180px; min-height: 120px; max-height: 360px; display: grid; place-items: center; overflow: hidden; border: 0; border-radius: 6px; background: #eef1f5; cursor: zoom-in; }
.image-attachment img { width: 100%; max-height: 360px; display: block; object-fit: contain; }
.file-attachment { min-width: 280px; display: grid; grid-template-columns: 40px minmax(0, 1fr) 18px; align-items: center; gap: 9px; padding: 9px; border: 1px solid rgba(31,35,41,.1); border-radius: 6px; background: rgba(255,255,255,.72); color: var(--text-muted); text-align: left; cursor: pointer; }
.file-type { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 6px; background: #fff; color: #3370ff; font-size: 20px; }
.file-attachment > span:nth-child(2) { min-width: 0; display: grid; gap: 3px; }
.file-attachment b { overflow: hidden; color: var(--text-primary); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.file-attachment small { color: var(--text-muted); font-size: 12px; }
.reaction-list { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.reaction-list button { height: 25px; padding: 0 7px; border: 1px solid #dee0e3; border-radius: 7px; background: #fff; color: var(--text-body); cursor: pointer; }
.reaction-list button.active { border-color: #7aa2ff; background: #e8f3ff; }
.delivery-status { min-height: 18px; margin-top: 3px; color: var(--text-muted); font-size: 12px; }
.delivery-status button, .delivery-status span { display: flex; align-items: center; gap: 3px; border: 0; background: transparent; color: inherit; font-size: inherit; cursor: pointer; }
.delivery-status button.read { color: #3370ff; }
.delivery-status button:disabled { cursor: default; }
.delivery-status .failed { color: #f53f3f; }
.message-actions { position: absolute; top: 17px; left: calc(100% + 8px); display: flex; align-items: center; opacity: 0; padding: 2px; border: 1px solid var(--border-color); border-radius: 6px; background: #fff; box-shadow: 0 4px 12px rgba(31,35,41,.1); }
.mine .message-actions { right: calc(100% + 8px); left: auto; }
.message-row:hover .message-actions { opacity: 1; }
.message-actions .el-button { width: 28px; height: 28px; margin: 0; }
.new-message-float { position: sticky; z-index: 5; bottom: 12px; left: 50%; display: flex; align-items: center; gap: 5px; margin: 0 auto; padding: 7px 12px; border: 1px solid #bedaff; border-radius: 16px; background: #fff; color: #3370ff; box-shadow: 0 5px 18px rgba(31,35,41,.14); cursor: pointer; }
.composer { position: relative; flex: 0 0 auto; padding: 8px 14px 12px; border-top: 1px solid var(--border-color); background: #fff; }
.composer.dragging::after { position: absolute; z-index: 10; inset: 5px; display: grid; place-items: center; border: 2px dashed #7aa2ff; border-radius: 7px; background: rgba(232,243,255,.94); color: #3370ff; content: '松开即可上传文件'; font-weight: 650; pointer-events: none; }
.offline-notice { display: flex; align-items: center; gap: 6px; margin: -8px -14px 7px; padding: 5px 14px; background: #fff7e8; color: #b45309; font-size: 13px; }
.composer-reply { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 0 0 6px; padding: 6px 9px; border-left: 3px solid #3370ff; background: #f7f8fa; }
.composer-reply > span { min-width: 0; display: grid; gap: 2px; }
.composer-reply b { font-size: 14px; }
.composer-reply small { max-width: 600px; overflow: hidden; color: var(--text-muted); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.upload-queue { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 6px; }
.upload-queue > div { min-width: 230px; max-width: 280px; display: grid; grid-template-columns: 34px minmax(0,1fr) 24px 24px; align-items: center; gap: 7px; padding: 6px 7px; border: 1px solid var(--border-color); border-radius: 6px; }
.upload-queue > div.failed { border-color: #ffd0d0; }
.upload-file-icon { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 5px; background: #f2f7ff; color: #3370ff; }
.upload-queue > div > span:nth-child(2) { min-width: 0; display: grid; gap: 2px; }
.upload-queue b { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.upload-queue small { color: var(--text-muted); font-size: 12px; }
.upload-queue .el-progress { grid-column: 2 / 5; }
.composer-toolbar { height: 32px; display: flex; align-items: center; gap: 2px; }
.composer-toolbar .el-button { width: 30px; height: 30px; margin: 0; }
.at-button { font-size: 18px; font-weight: 700; }
.composer-main { display: grid; grid-template-columns: minmax(0,1fr) 72px; align-items: end; gap: 10px; }
.composer-main :deep(.el-textarea__inner) { min-height: 70px !important; padding: 7px 9px; border: 0; box-shadow: none; font-size: 15px; line-height: 1.55; }
.composer-main > .el-button { height: 38px; }
.conversation-readonly { min-height: 50px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; gap: 7px; border-top: 1px solid var(--border-color); background: #fff; color: var(--text-muted); }
.conversation-readonly span { color: var(--text-body); font-size: 14px; font-weight: 600; }
.conversation-readonly small { font-size: 12px; }
.mention-picker { position: absolute; z-index: 20; bottom: calc(100% - 34px); left: 14px; width: 310px; max-height: 330px; overflow: auto; border: 1px solid var(--border-color); border-radius: 7px; background: #fff; box-shadow: 0 12px 30px rgba(31,35,41,.16); }
.mention-picker header { position: sticky; top: 0; display: grid; gap: 7px; padding: 10px; border-bottom: 1px solid var(--border-soft); background: #fff; }
.mention-picker > button { width: 100%; min-height: 48px; display: flex; align-items: center; gap: 9px; padding: 7px 10px; border: 0; background: #fff; text-align: left; cursor: pointer; }
.mention-picker > button:hover { background: #f2f7ff; }
.mention-picker > button > span:last-child { min-width: 0; display: grid; gap: 2px; }
.mention-picker b { color: var(--text-primary); font-size: 15px; }
.mention-picker small { color: var(--text-muted); font-size: 13px; }
.mention-all { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; background: #e8f3ff; color: #3370ff; font-weight: 750; }
.emoji-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 3px; }
.emoji-grid button { height: 28px; border: 0; border-radius: 5px; background: transparent; font-size: 18px; cursor: pointer; }
.emoji-grid button:hover { background: #f2f3f5; }
.chat-empty { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); text-align: center; }
.chat-empty-icon { width: 72px; height: 72px; display: grid; place-items: center; border-radius: 50%; background: #e8f3ff; color: #3370ff; font-size: 32px; }
.chat-empty h2 { margin: 18px 0 7px; font-size: 18px; }
.chat-empty p { margin: 0 0 18px; font-size: 14px; }
.details-pane { border-left: 1px solid var(--border-color); background: #fff; }
.contact-picker { height: 330px; overflow-y: auto; margin-top: 12px; border: 1px solid var(--border-color); border-radius: 7px; padding: 4px; }
.contact-picker.compact { height: 300px; }
.contact-picker button { width: 100%; min-height: 55px; display: flex; align-items: center; gap: 10px; padding: 7px 9px; border: 0; border-radius: 6px; background: #fff; text-align: left; cursor: pointer; }
.contact-picker button:hover, .contact-picker button.selected { background: #f2f7ff; }
.contact-picker .avatar-wrap { position: relative; }
.contact-picker .avatar-wrap .presence-dot { width: 9px; height: 9px; }
.contact-picker button > span:nth-child(2) { min-width: 0; flex: 1; display: grid; gap: 3px; }
.contact-picker b { color: var(--text-primary); font-size: 15px; }
.contact-picker small { color: var(--text-muted); font-size: 13px; }
.contact-picker .contact-presence { width: 78px; flex: 0 0 auto; overflow: hidden; color: var(--text-muted); font-size: 12px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.contact-picker .contact-presence.online { color: #00a82d; font-weight: 600; }
.selected-icon, .contact-picker button > .el-icon { color: #3370ff; }
.search-submit { width: 100%; margin: 10px 0 14px; }
.search-result-list { display: grid; }
.search-result-list button { padding: 12px 5px; border: 0; border-bottom: 1px solid var(--border-soft); background: #fff; text-align: left; cursor: pointer; }
.search-result-list button:hover { background: #f7f8fa; }
.search-result-list span { display: flex; justify-content: space-between; }
.search-result-list b { font-size: 14px; }
.search-result-list time { color: var(--text-muted); font-size: 10px; }
.search-result-list p { margin: 5px 0 0; color: var(--text-body); font-size: 14px; line-height: 1.5; }
.receipt-users { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.receipt-users span { display: flex; align-items: center; gap: 8px; padding: 7px; }
.forward-list { height: 320px; overflow-y: auto; margin-top: 10px; }
.forward-list button { width: 100%; height: 52px; display: flex; align-items: center; gap: 9px; padding: 6px 8px; border: 0; border-radius: 6px; background: #fff; cursor: pointer; }
.forward-list button:hover, .forward-list button.selected { background: #f2f7ff; }
.forward-list span { flex: 1; text-align: left; }
.forward-list .el-icon { color: #3370ff; }
.task-source-preview { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 5px 10px; margin-bottom: 16px; padding: 10px 12px; border-left: 3px solid #3370ff; background: #f7f8fa; }
.task-source-preview > span { grid-row: 1 / 3; color: #86909c; font-size: 13px; }
.task-source-preview b { font-size: 14px; }
.task-source-preview p { margin: 0; overflow: hidden; color: #4e5969; font-size: 13px; line-height: 20px; text-overflow: ellipsis; white-space: nowrap; }
.task-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.task-form-grid :deep(.el-select), .task-form-grid :deep(.el-date-editor) { width: 100%; }
.reminder-options { display: flex; flex-wrap: wrap; }
.business-form-row { width: 100%; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 9px; }
.business-form-row :deep(.el-input-number), .business-form-row :deep(.el-select) { width: 100%; }
.task-board-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #e5e6eb; }
.task-board-toolbar > .el-select { width: 130px; }
.task-stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); margin: 14px 0; border: 1px solid #e5e6eb; border-radius: 7px; }
.task-stats-strip span { display: grid; gap: 2px; padding: 10px 12px; border-right: 1px solid #e5e6eb; color: #86909c; font-size: 12px; }
.task-stats-strip span:last-child { border-right: 0; }
.task-stats-strip b { color: #1d2129; font-size: 20px; }
.task-stats-strip .danger b { color: #d92d20; }
.task-board-list { display: grid; gap: 10px; padding-bottom: 20px; }
.task-board-list > :deep(.task-card) { width: 100%; }
.task-evidence-upload { width: 100%; display: grid; gap: 6px; margin-top: 10px; }
.task-evidence-upload > div { display: grid; grid-template-columns: minmax(0, 1fr) 30px 30px; align-items: center; gap: 6px; min-height: 44px; padding: 6px 8px; border: 1px solid #e5e6eb; border-radius: 6px; }
.task-evidence-upload span { min-width: 0; display: grid; gap: 2px; }
.task-evidence-upload b { overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.task-evidence-upload small { color: #86909c; font-size: 12px; }
.task-evidence-upload .el-progress { grid-column: 1 / 4; }
@media (max-width: 1540px) {
  .im-shell { grid-template-columns: 320px minmax(620px, 1fr); }
  .details-pane { display: none; }
}
@media (max-width: 1120px) {
  .im-shell { grid-template-columns: 300px minmax(0, 1fr); }
  .message-list { padding-inline: 18px; }
}
@media (max-width: 760px) {
  .im-shell { display: block; border: 0; }
  .conversation-pane, .chat-pane { width: 100%; height: 100%; }
  .mobile-chat .conversation-pane { display: none; }
  .mobile-list .chat-pane { display: none; }
  .mobile-back { display: grid; }
  .chat-head { padding: 0 8px; }
  .chat-head-actions .el-button:nth-child(3), .chat-head-actions .el-button:nth-child(4) { display: none; }
  .message-list { padding: 12px 10px 18px; }
  .message-column { max-width: 82%; }
  .message-actions { position: static; margin-top: 3px; opacity: 1; box-shadow: none; }
  .image-attachment { width: min(280px, 68vw); }
  .file-attachment { min-width: min(270px, 72vw); }
  .composer { padding-inline: 9px; }
  .mention-picker { right: 9px; left: 9px; width: auto; }
  .task-form-grid { grid-template-columns: 1fr; }
  .business-form-row { grid-template-columns: 1fr; }
  .task-board-toolbar { align-items: stretch; flex-direction: column; }
  .task-board-toolbar :deep(.el-radio-group) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .task-board-toolbar :deep(.el-radio-button__inner) { width: 100%; }
  .task-board-toolbar > .el-select { width: 100%; }
  .task-stats-strip { grid-template-columns: repeat(2, 1fr); }
  .task-stats-strip span:nth-child(2) { border-right: 0; }
  .task-stats-strip span:nth-child(-n+2) { border-bottom: 1px solid #e5e6eb; }
}

.message-ctx {
  position: fixed;
  z-index: 3000;
  width: 208px;
  padding: 6px;
  border: 1px solid #e2e6ee;
  border-radius: 11px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(20, 30, 55, .18);
}
.message-ctx button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #5f6672;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}
.message-ctx button:hover { background: #f6f8fb; color: #1f2329; }
.message-ctx .ctx-issue { color: #3370ff; background: #eaf1ff; font-weight: 500; }
.message-ctx .ctx-issue:hover { background: #dbe8ff; }
.message-ctx .ctx-sep { height: 1px; margin: 5px 4px; background: #e2e6ee; }
.issue-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.issue-form-row :deep(.el-date-editor), .issue-form-row :deep(.el-select) { width: 100%; }
@media (max-width: 560px) {
  .issue-form-row { grid-template-columns: 1fr; }
}
</style>
