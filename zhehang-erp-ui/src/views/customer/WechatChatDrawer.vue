<template>
  <el-drawer v-model="visible" :title="`${staffName || wechatId} · 微信聊天`" size="1080px" append-to-body class="wx-drawer">
    <div class="wx-chat">
      <!-- 最左:员工导航 -->
      <div class="wx-nav">
        <el-avatar v-if="staffHead" :src="staffHead" :size="42" shape="square" class="wx-me" />
        <div v-else class="wx-me wx-me-txt">{{ (staffName || '微').slice(0, 1) }}</div>
        <a :class="{ on: nav === 'single' }" @click="nav = 'single'"><span class="ni">💬</span>单聊</a>
        <a :class="{ on: nav === 'room' }" @click="nav = 'room'"><span class="ni">👥</span>群聊</a>
        <a :class="{ on: nav === 'moments' }" @click="nav = 'moments'"><span class="ni">🌤️</span>朋友圈</a>
        <a :class="{ on: nav === 'contacts' }" @click="nav = 'contacts'"><span class="ni">📇</span>通讯录</a>
        <a :class="{ on: nav === 'stats' }" @click="nav = 'stats'"><span class="ni">📊</span>统计</a>
      </div>

      <!-- 中:会话列表(单聊/群聊时) -->
      <div class="wx-sess" v-if="isChat" v-loading="loading">
        <div class="wx-sess-top">
          <div class="wx-search"><el-icon><Search /></el-icon><input v-model="sessKeyword" placeholder="搜会话 / 内容" /></div>
        </div>
        <div class="wx-sess-scroll">
          <div v-for="s in filteredSessions" :key="s.talker" class="wx-sitem" :class="{ on: cur === s.talker }" @click="openSession(s.talker, s.roomid, sessName(s))">
            <el-avatar v-if="s.headUrl" :src="s.headUrl" :size="36" shape="square" class="wx-av-img" />
            <div v-else class="wx-av" :class="{ room: s.roomid }">{{ s.roomid ? '群' : (s.name || shortName(s.talker)).slice(0, 1) }}</div>
            <div class="wx-si-body">
              <div class="wx-si-name">{{ sessName(s) }}</div>
              <div class="wx-si-last">{{ preview(s.lastType, s.lastContent) }}</div>
            </div>
            <div class="wx-si-meta"><span class="wx-si-time">{{ fmtDay(s.lastTime) }}</span><span class="wx-si-cnt">{{ s.count }}</span></div>
          </div>
          <el-empty v-if="!filteredSessions.length && !loading" :description="sessions.length ? '没有匹配的会话' : '暂无聊天(后台正在同步)'" :image-size="60" />
        </div>
      </div>

      <!-- 右:聊天内容(单聊/群聊时) -->
      <div class="wx-main" v-if="isChat">
        <div v-if="!cur" class="wx-empty"><el-icon :size="42"><ChatDotRound /></el-icon><p>← 选一个会话,看聊天记录</p></div>
        <template v-else>
          <div class="wx-main-hd">{{ curName || (curRoom ? '群聊' : shortName(cur)) }} · {{ messages.length }} 条</div>
          <div class="wx-tools">
            <div class="wx-search sm"><el-icon><Search /></el-icon><input v-model="msgKeyword" placeholder="搜聊天内容" @keyup.enter="loadMsg" /></div>
            <el-select v-model="msgType" size="small" placeholder="全部类型" clearable class="wx-type" @change="loadMsg">
              <el-option label="文本" :value="1" /><el-option label="图片" :value="2" /><el-option label="语音" :value="3" />
              <el-option label="视频" :value="4" /><el-option label="文件" :value="9" /><el-option label="链接" :value="10" />
            </el-select>
            <el-date-picker v-model="msgRange" type="daterange" size="small" range-separator="~" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="wx-date" @change="loadMsg" />
            <el-button size="small" class="wx-query" @click="loadMsg">查询</el-button>
          </div>
          <div class="wx-stream" ref="scrollEl" v-loading="msgLoading">
            <div v-for="(m, i) in messages" :key="i" class="wx-row" :class="m.mine === 1 ? 'mine' : 'other'">
              <div class="wx-ba">{{ m.mine === 1 ? '我' : (curRoom ? shortName(m.talker).slice(0, 1) : shortName(cur).slice(0, 1)) }}</div>
              <div class="wx-bubble">
                <template v-if="[1, 21, 22].includes(m.msgType)">{{ m.content || '' }}</template>
                <el-image v-else-if="[2, 8].includes(m.msgType)" :src="m.fileTh || m.fileUrl" :preview-src-list="[m.fileUrl || m.fileTh]" fit="cover" class="wx-img" hide-on-click-modal preview-teleported />
                <span v-else-if="m.msgType === 3" class="wx-file">🎤 语音 {{ m.content || '' }}″</span>
                <a v-else-if="m.msgType === 9" :href="m.fileUrl" target="_blank" class="wx-file">📎 {{ m.content || '文件' }}</a>
                <a v-else-if="m.msgType === 4" :href="m.fileUrl" target="_blank" class="wx-file">🎬 视频</a>
                <a v-else-if="m.msgType === 10" :href="m.fileUrl" target="_blank" class="wx-file">🔗 {{ m.content || '链接' }}</a>
                <span v-else-if="m.msgType === 13" class="wx-file">👤 名片 {{ m.content || '' }}</span>
                <span v-else-if="m.msgType === 14" class="wx-file">📍 {{ m.content || '位置' }}</span>
                <span v-else class="wx-sys">[{{ typeName(m.msgType) }}]</span>
              </div>
              <div class="wx-time">{{ fmtTime(m.msgTime) }}</div>
            </div>
            <el-empty v-if="!messages.length && !msgLoading" description="该条件下无消息" :image-size="60" />
          </div>
        </template>
      </div>

      <!-- 朋友圈:该员工发布的朋友圈(实时拉云客) -->
      <div class="wx-panel" v-else-if="nav === 'moments'">
        <div class="wx-panel-hd">
          <span class="wx-panel-t">🌤️ 朋友圈</span>
          <el-date-picker v-model="momRange" type="daterange" size="small" range-separator="~" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" class="wx-date" @change="loadMoments" />
          <el-button size="small" class="wx-query" @click="loadMoments">查询</el-button>
        </div>
        <div class="wx-panel-body" v-loading="momLoading">
          <div v-for="(m, i) in moments" :key="i" class="wx-mom">
            <el-avatar v-if="staffHead" :src="staffHead" :size="32" shape="square" class="wx-av-img" />
            <div v-else class="wx-ba">{{ (staffName || '我').slice(0, 1) }}</div>
            <div class="wx-mom-main">
              <div class="wx-mom-name">{{ staffName || wechatId }}</div>
              <div v-if="momText(m)" class="wx-mom-text">{{ momText(m) }}</div>
              <div v-if="momImgs(m).length" class="wx-mom-imgs">
                <el-image v-for="(img, j) in momImgs(m)" :key="j" :src="img" :preview-src-list="momImgs(m)" :initial-index="j" fit="cover" class="wx-mom-img" hide-on-click-modal preview-teleported />
              </div>
              <div class="wx-mom-time">{{ momTime(m) }}</div>
            </div>
          </div>
          <el-empty v-if="!moments.length && !momLoading" :description="momError || '该时段没发朋友圈'" :image-size="60" />
        </div>
      </div>

      <!-- 通讯录:该员工的微信好友(好友库) -->
      <div class="wx-panel" v-else-if="nav === 'contacts'">
        <div class="wx-panel-hd">
          <span class="wx-panel-t">📇 通讯录<em v-if="ctTotal" class="wx-panel-n">{{ ctTotal }} 人</em></span>
          <div class="wx-search sm"><el-icon><Search /></el-icon><input v-model="ctKeyword" placeholder="搜昵称 / 备注 / 微信号" @keyup.enter="reloadContacts" /></div>
          <el-button size="small" class="wx-query" @click="reloadContacts">查询</el-button>
        </div>
        <div class="wx-panel-body" v-loading="ctLoading && !contacts.length">
          <div v-for="f in contacts" :key="f.id" class="wx-ct">
            <el-avatar v-if="f.headUrl" :src="f.headUrl" :size="36" shape="square" class="wx-av-img" />
            <div v-else class="wx-av">{{ (f.friendRemark || f.friendNickname || '友').slice(0, 1) }}</div>
            <div class="wx-ct-main">
              <div class="wx-ct-name">{{ f.friendRemark || f.friendNickname || '未命名' }}<span v-if="f.friendRemark && f.friendNickname" class="wx-ct-nick">({{ f.friendNickname }})</span></div>
              <div class="wx-ct-sub">{{ f.friendAlias || '—' }}<template v-if="f.friendWxPhone"> · {{ f.friendWxPhone }}</template></div>
            </div>
            <div class="wx-ct-tags"><el-tag v-for="tg in ctLabels(f)" :key="tg" size="small" effect="plain">{{ tg }}</el-tag></div>
          </div>
          <div v-if="contacts.length && contacts.length < ctTotal" class="wx-more">
            <el-button size="small" text :loading="ctLoading" @click="loadContacts(false)">加载更多({{ contacts.length }}/{{ ctTotal }})</el-button>
          </div>
          <el-empty v-if="!contacts.length && !ctLoading" description="暂无该员工的好友数据(可能未同步)" :image-size="60" />
        </div>
      </div>

      <!-- 统计:该员工微信的真实数字 -->
      <div class="wx-panel" v-else>
        <div class="wx-panel-hd"><span class="wx-panel-t">📊 统计</span></div>
        <div class="wx-panel-body" v-loading="momLoading || ctLoading">
          <div class="wx-st-grid">
            <div class="wx-st"><b>{{ statSingle }}</b><span>单聊会话</span></div>
            <div class="wx-st"><b>{{ statRoom }}</b><span>群聊</span></div>
            <div class="wx-st"><b>{{ statMsg }}</b><span>消息总数</span></div>
            <div class="wx-st"><b>{{ ctTotal || '—' }}</b><span>微信好友</span></div>
            <div class="wx-st"><b>{{ momLoaded ? moments.length : '—' }}</b><span>近30天朋友圈</span></div>
            <div class="wx-st"><b>{{ statLastDay || '—' }}</b><span>最近聊天日</span></div>
          </div>
          <p class="wx-st-note">口径:会话/消息来自已同步的聊天记录;好友数来自好友库;朋友圈为最近30天实时拉取。</p>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { ChatDotRound, Search } from '@element-plus/icons-vue'
import { yunkeApi } from '@/api/yunke'
import { wechatFriendApi } from '@/api/wechat'

const visible = ref(false)
const wechatId = ref('')
const staffName = ref('')
const staffHead = ref('')
const sessions = ref<any[]>([])
const messages = ref<any[]>([])
const cur = ref('')
const curRoom = ref(false)
const loading = ref(false)
const msgLoading = ref(false)
const scrollEl = ref<HTMLElement | null>(null)

const nav = ref('single')
const isChat = computed(() => nav.value === 'single' || nav.value === 'room')
const sessKeyword = ref('')
const msgKeyword = ref('')
const msgType = ref<number | ''>('')
const msgRange = ref<string[]>([])

const filteredSessions = computed(() => {
  let list = sessions.value.filter((s) => (nav.value === 'room' ? s.roomid : !s.roomid))
  const k = sessKeyword.value.trim()
  if (k) list = list.filter((s) => (s.talker || '').includes(k) || (s.lastContent || '').includes(k))
  return list
})

const open = (wid: string, name: string, head?: string) => {
  wechatId.value = wid
  staffName.value = name
  staffHead.value = head || ''
  nav.value = 'single'
  cur.value = ''
  messages.value = []
  sessions.value = []
  sessKeyword.value = ''
  moments.value = []
  momRange.value = []
  momLoaded.value = false
  momError.value = ''
  contacts.value = []
  ctTotal.value = 0
  ctKeyword.value = ''
  ctPage.value = 0
  visible.value = true
  loadSessions()
}
defineExpose({ open })

const loadSessions = async () => {
  loading.value = true
  try {
    const res: any = await yunkeApi.wechatChat({ wechatId: wechatId.value })
    const d = res?.data ?? res
    sessions.value = d?.sessions || []
  } catch { sessions.value = [] } finally { loading.value = false }
}

const curName = ref('')
const sessName = (s: any) => s.name || (s.roomid ? '群聊' : shortName(s.talker))
const openSession = (talker: string, roomid?: string, name?: string) => {
  cur.value = talker
  curName.value = name || ''
  curRoom.value = !!roomid
  msgKeyword.value = ''
  msgType.value = ''
  msgRange.value = []
  loadMsg()
}

const loadMsg = async () => {
  if (!cur.value) return
  msgLoading.value = true
  try {
    const params: any = { wechatId: wechatId.value }
    if (curRoom.value) params.roomid = cur.value
    else params.talker = cur.value
    if (msgKeyword.value.trim()) params.keyword = msgKeyword.value.trim()
    if (msgType.value !== '') params.msgType = msgType.value
    if (msgRange.value?.length === 2) { params.beginYmd = msgRange.value[0]; params.endYmd = msgRange.value[1] }
    const res: any = await yunkeApi.wechatChat(params)
    const d = res?.data ?? res
    messages.value = d?.messages || []
    await nextTick()
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  } catch { messages.value = [] } finally { msgLoading.value = false }
}

const shortName = (t?: string) => {
  if (!t) return '—'
  return t.length > 14 ? t.slice(0, 10) + '…' : t
}
const fmtTime = (t?: string) => (t ? String(t).replace('T', ' ').slice(5, 16) : '')
const fmtDay = (t?: string) => (t ? String(t).replace('T', ' ').slice(5, 10) : '')
const typeName = (ty: number) => (({ 1: '文本', 2: '图片', 3: '语音', 4: '视频', 8: 'GIF', 9: '文件', 10: '链接', 13: '名片', 14: '位置', 15: '系统', 18: '小程序', 21: '引用', 22: '拍一拍' } as Record<number, string>)[ty] || '消息')
const preview = (ty: number, content?: string) => {
  if ([1, 21, 22].includes(ty)) return content || ''
  return '[' + typeName(ty) + ']'
}

/* ---------- 朋友圈(云客实时拉取) ---------- */
const moments = ref<any[]>([])
const momRange = ref<string[]>([])
const momLoading = ref(false)
const momLoaded = ref(false)
const momError = ref('')

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const loadMoments = async () => {
  if (!wechatId.value) return
  if (!momRange.value || momRange.value.length !== 2) {
    const end = new Date()
    const begin = new Date(end.getTime() - 29 * 86400000)
    momRange.value = [ymd(begin), ymd(end)]
  }
  momLoading.value = true
  momError.value = ''
  try {
    const res: any = await yunkeApi.moments({ wechatId: wechatId.value, beginYmd: momRange.value[0], endYmd: momRange.value[1] })
    const d = res?.data ?? res
    moments.value = d?.list || d?.moments || (Array.isArray(d) ? d : [])
    momLoaded.value = true
  } catch {
    moments.value = []
    momLoaded.value = true
    momError.value = '云客接口暂时没响应,稍后再试'
  } finally { momLoading.value = false }
}

/* 云客朋友圈字段名各版本不统一,做兜底映射 */
const momText = (m: any) => m?.content || m?.text || m?.title || m?.desc || ''
const momImgs = (m: any): string[] => {
  const raw = m?.images ?? m?.imgUrls ?? m?.imageUrls ?? m?.imgs ?? m?.urls ?? m?.picUrls
  if (!raw) return []
  if (Array.isArray(raw)) return raw.filter(Boolean).map((x: any) => (typeof x === 'string' ? x : x?.url || '')).filter(Boolean)
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}
const momTime = (m: any) => {
  const t = m?.createTime || m?.time || m?.publishTime || m?.sendTime || ''
  return t ? String(t).replace('T', ' ').slice(0, 16) : ''
}

/* ---------- 通讯录(好友库) ---------- */
const contacts = ref<any[]>([])
const ctTotal = ref(0)
const ctKeyword = ref('')
const ctLoading = ref(false)
const ctPage = ref(0)
const CT_SIZE = 50

const loadContacts = async (reset: boolean) => {
  if (!wechatId.value) return
  ctLoading.value = true
  try {
    const page = reset ? 1 : ctPage.value + 1
    const params: any = { pageNum: page, pageSize: CT_SIZE, wxId: wechatId.value }
    if (ctKeyword.value.trim()) params.keyword = ctKeyword.value.trim()
    const res: any = await wechatFriendApi.list(params)
    const d = res?.data ?? res
    const rows = d?.records || d?.list || d?.rows || []
    contacts.value = reset ? rows : contacts.value.concat(rows)
    ctTotal.value = Number(d?.total ?? contacts.value.length)
    ctPage.value = page
  } catch {
    if (reset) { contacts.value = []; ctTotal.value = 0 }
  } finally { ctLoading.value = false }
}
const reloadContacts = () => loadContacts(true)

const ctLabels = (f: any): string[] => {
  const raw = f?.contactLabelValues
  if (!raw) return []
  return String(raw).split(/[,，]/).map((s: string) => s.trim()).filter(Boolean).slice(0, 4)
}

/* ---------- 统计(会话+好友+朋友圈聚合) ---------- */
const statSingle = computed(() => sessions.value.filter((s) => !s.roomid).length)
const statRoom = computed(() => sessions.value.filter((s) => s.roomid).length)
const statMsg = computed(() => sessions.value.reduce((sum, s) => sum + (Number(s.count) || 0), 0))
const statLastDay = computed(() => {
  let max = ''
  for (const s of sessions.value) {
    const t = s.lastTime ? String(s.lastTime) : ''
    if (t && t > max) max = t
  }
  return max ? max.replace('T', ' ').slice(0, 10) : ''
})

/* 切标签懒加载:第一次进该标签才拉数据 */
watch(nav, (v) => {
  if (v === 'moments' && !momLoaded.value) loadMoments()
  if (v === 'contacts' && !ctPage.value) loadContacts(true)
  if (v === 'stats') {
    if (!momLoaded.value) loadMoments()
    if (!ctPage.value) loadContacts(true)
  }
})
</script>

<style scoped>
/* 方案2三栏布局 + 方案1微信绿配色 */
.wx-chat { display: flex; height: calc(100vh - 120px); border: 1px solid #E0E0E0; border-radius: 8px; overflow: hidden; font-size: 13px; background: #fff; }

/* 最左员工导航 */
.wx-nav { width: 76px; flex: 0 0 auto; background: #EDEDED; border-right: 1px solid #E0E0E0; display: flex; flex-direction: column; align-items: center; padding: 16px 0; gap: 2px; }
.wx-me { margin-bottom: 12px; border-radius: 8px; }
.wx-me-txt { width: 42px; height: 42px; background: #07C160; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; }
.wx-nav a { width: 100%; text-align: center; font-size: 11px; color: #7A7A7A; padding: 8px 0; cursor: pointer; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
.wx-nav a .ni { font-size: 17px; filter: grayscale(0.3); }
.wx-nav a:hover { background: #E3E3E3; }
.wx-nav a.on { color: #07C160; font-weight: 600; background: #E1F5E9; }

/* 中会话列表 */
.wx-sess { width: 248px; flex: 0 0 auto; background: #EDEDED; border-right: 1px solid #E0E0E0; display: flex; flex-direction: column; }
.wx-sess-top { padding: 12px 12px 10px; }
.wx-search { display: flex; align-items: center; gap: 6px; background: #fff; border-radius: 7px; padding: 6px 10px; color: #999; font-size: 12px; }
.wx-search input { border: none; outline: none; flex: 1; background: transparent; font-size: 12px; color: #333; }
.wx-search.sm { width: 168px; flex: 0 0 auto; border: 1px solid #E5E5E5; }
.wx-sess-scroll { flex: 1; overflow-y: auto; }
.wx-sitem { display: flex; gap: 9px; padding: 11px 12px; align-items: center; cursor: pointer; }
.wx-sitem:hover { background: #E3E3E3; }
.wx-sitem.on { background: #D6D6D6; }
.wx-av { width: 36px; height: 36px; border-radius: 8px; flex: 0 0 auto; background: linear-gradient(135deg, #5DD39E, #3B9C7A); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; }
.wx-av-img { flex: 0 0 auto; border-radius: 8px; }
.wx-av.room { background: linear-gradient(135deg, #78C1F3, #4A90D9); }
.wx-si-body { flex: 1; min-width: 0; }
.wx-si-name { font-weight: 600; color: #1A1A1A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wx-si-last { font-size: 11.5px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.wx-si-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex: 0 0 auto; }
.wx-si-time { font-size: 10.5px; color: #999; }
.wx-si-cnt { font-size: 10px; background: #C4C4C4; color: #fff; border-radius: 9px; min-width: 16px; text-align: center; padding: 0 5px; }

/* 右聊天区 */
.wx-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.wx-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #B0B0B0; }
.wx-main-hd { padding: 12px 16px; font-weight: 650; color: #1A1A1A; border-bottom: 1px solid #EEE; }
.wx-tools { display: flex; gap: 8px; align-items: center; padding: 8px 12px; border-bottom: 1px solid #EEE; background: #FAFAFA; flex-wrap: wrap; }
.wx-type { width: 108px; }
.wx-date { width: 210px; }
.wx-query { background: #07C160; border-color: #07C160; color: #fff; }
.wx-query:hover { background: #06AD56; border-color: #06AD56; }
.wx-stream { flex: 1; overflow-y: auto; padding: 18px 20px; background: #EDEDED; display: flex; flex-direction: column; }
.wx-row { display: flex; gap: 8px; max-width: 74%; margin-bottom: 16px; }
.wx-row.other { align-items: flex-start; }
.wx-row.mine { margin-left: auto; flex-direction: row-reverse; }
.wx-ba { width: 32px; height: 32px; border-radius: 6px; flex: 0 0 auto; background: #5DD39E; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; }
.wx-row.mine .wx-ba { background: #07C160; }
.wx-bubble { padding: 8px 12px; border-radius: 8px; line-height: 1.55; word-break: break-word; white-space: pre-wrap; font-size: 13px; position: relative; }
.wx-row.other .wx-bubble { background: #fff; color: #1A1A1A; }
.wx-row.mine .wx-bubble { background: #95EC69; color: #1A1A1A; }
.wx-img { max-width: 180px; max-height: 220px; border-radius: 6px; display: block; }
.wx-file { color: #576B95; text-decoration: none; }
.wx-sys { color: #999; }
.wx-time { align-self: flex-end; font-size: 11px; color: #999; margin: 0 2px; }
.wx-row.mine .wx-time { align-self: flex-start; }

/* 朋友圈/通讯录/统计面板(共用骨架) */
.wx-panel { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #F7F7F7; }
.wx-panel-hd { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #fff; border-bottom: 1px solid #EEE; flex-wrap: wrap; }
.wx-panel-t { font-weight: 650; color: #1A1A1A; font-size: 14px; margin-right: auto; }
.wx-panel-n { font-style: normal; font-size: 12px; color: #07C160; font-weight: 600; margin-left: 6px; }
.wx-panel-body { flex: 1; overflow-y: auto; padding: 14px 16px; }

/* 朋友圈卡片 */
.wx-mom { display: flex; gap: 10px; background: #fff; border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; }
.wx-mom-main { flex: 1; min-width: 0; }
.wx-mom-name { font-weight: 600; color: #576B95; margin-bottom: 4px; }
.wx-mom-text { color: #1A1A1A; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
.wx-mom-imgs { display: grid; grid-template-columns: repeat(3, 88px); gap: 6px; margin-top: 8px; }
.wx-mom-img { width: 88px; height: 88px; border-radius: 6px; cursor: zoom-in; }
.wx-mom-time { font-size: 11.5px; color: #999; margin-top: 8px; }

/* 通讯录行 */
.wx-ct { display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 8px; padding: 9px 12px; margin-bottom: 6px; }
.wx-ct-main { flex: 1; min-width: 0; }
.wx-ct-name { font-weight: 600; color: #1A1A1A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wx-ct-nick { font-weight: 400; color: #888; font-size: 12px; margin-left: 4px; }
.wx-ct-sub { font-size: 11.5px; color: #999; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wx-ct-tags { display: flex; gap: 4px; flex: 0 0 auto; flex-wrap: wrap; justify-content: flex-end; max-width: 40%; }
.wx-more { text-align: center; padding: 8px 0 2px; }

/* 统计磁贴 */
.wx-st-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.wx-st { background: #fff; border-radius: 8px; padding: 16px 12px; text-align: center; }
.wx-st b { display: block; font-size: 24px; color: #07C160; line-height: 1.2; }
.wx-st span { display: block; font-size: 12px; color: #888; margin-top: 6px; }
.wx-st-note { font-size: 11.5px; color: #AAA; margin: 12px 2px 0; line-height: 1.6; }
</style>
