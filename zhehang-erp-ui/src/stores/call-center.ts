import { defineStore } from 'pinia'
import type {
  AgentStatus,
  PhoneState,
  CurrentCall,
  PopupData,
  CallDirection
} from '@/api/call-center'
import { changeAgentStatus } from '@/api/call-center'

/** 呼叫中心全局状态 store */
export const useCallCenterStore = defineStore('callCenter', {
  state: () => ({
    /** 当前登录坐席的 ID（与系统用户对应） */
    currentAgentId: null as number | null,
    /** 当前坐席工号 */
    currentAgentNo: '' as string,
    /** 坐席状态 */
    currentAgentStatus: 'offline' as AgentStatus,
    /** 状态切换的时间戳（毫秒） */
    statusChangedAt: 0 as number,

    /** 软电话状态 */
    phoneState: 'idle' as PhoneState,
    /** 是否静音 */
    muted: false as boolean,
    /** 是否保持 */
    onHold: false as boolean,
    /** 当前通话信息 */
    currentCall: null as CurrentCall | null,

    /** 来电弹屏可见性 */
    popupVisible: false as boolean,
    /** 来电弹屏数据 */
    popupData: null as PopupData | null,

    /** 今日通话计数 */
    todayCallCount: 0 as number,
    /** 今日通话总秒数 */
    todayTalkSec: 0 as number
  }),

  getters: {
    /** 是否在线 */
    isOnline: state => state.currentAgentStatus !== 'offline',
    /** 是否处于通话中 */
    isInCall: state => state.phoneState === 'talking' || state.phoneState === 'hold',
    /** 是否可以接听 */
    canAnswer: state => state.phoneState === 'ringing',
    /** 状态保持时长（秒） */
    statusDurationSec(): number {
      if (!this.statusChangedAt) return 0
      return Math.floor((Date.now() - this.statusChangedAt) / 1000)
    }
  },

  actions: {
    /** 设置当前坐席身份（登录后调用） */
    setAgentIdentity(payload: { agentId: number; agentNo: string }) {
      this.currentAgentId = payload.agentId
      this.currentAgentNo = payload.agentNo
    },

    /** 切换坐席状态 */
    async changeStatus(status: AgentStatus) {
      const prev = this.currentAgentStatus
      this.currentAgentStatus = status
      this.statusChangedAt = Date.now()
      if (status === 'offline') {
        this.phoneState = 'idle'
        this.currentCall = null
      }
      if (this.currentAgentId) {
        try {
          await changeAgentStatus(this.currentAgentId, status)
        } catch (e) {
          // 接口失败回滚
          this.currentAgentStatus = prev
          throw e
        }
      }
    },

    /** 发起呼叫 */
    startCall(number: string, direction: CallDirection = 'outbound') {
      this.phoneState = direction === 'inbound' ? 'ringing' : 'dialing'
      this.currentCall = {
        callId: 'CID' + Date.now(),
        direction,
        peer: number,
        startTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: this.phoneState
      }
    },

    /** 应答通话 */
    answerCall() {
      if (!this.currentCall) return
      this.phoneState = 'talking'
      this.currentCall.status = 'talking'
      if (this.currentAgentStatus === 'idle') {
        this.currentAgentStatus = 'busy'
      }
    },

    /** 结束通话 */
    endCall() {
      if (this.currentCall) {
        const startMs = new Date(this.currentCall.startTime.replace(' ', 'T')).getTime()
        const dur = Math.max(0, Math.floor((Date.now() - startMs) / 1000))
        this.todayCallCount += 1
        this.todayTalkSec += dur
      }
      this.currentCall = null
      this.muted = false
      this.onHold = false
      this.phoneState = 'afterwork'
      this.popupVisible = false
      this.popupData = null
      // 进入话后处理状态
      if (this.currentAgentStatus === 'busy') {
        this.currentAgentStatus = 'afterwork'
        this.statusChangedAt = Date.now()
      }
    },

    /** 完成话后处理，回到空闲 */
    finishAfterwork() {
      if (this.phoneState === 'afterwork') {
        this.phoneState = 'idle'
      }
      if (this.currentAgentStatus === 'afterwork') {
        this.currentAgentStatus = 'idle'
        this.statusChangedAt = Date.now()
      }
    },

    /** 切换静音 */
    toggleMute() {
      this.muted = !this.muted
    },

    /** 切换保持 */
    toggleHold() {
      this.onHold = !this.onHold
      if (this.phoneState === 'talking' && this.onHold) {
        this.phoneState = 'hold'
      } else if (this.phoneState === 'hold' && !this.onHold) {
        this.phoneState = 'talking'
      }
    },

    /** 显示来电弹屏 */
    showPopup(data: PopupData) {
      this.popupData = data
      this.popupVisible = true
    },

    /** 关闭来电弹屏 */
    hidePopup() {
      this.popupVisible = false
      this.popupData = null
    },

    /** 重置 store */
    resetState() {
      this.currentAgentId = null
      this.currentAgentNo = ''
      this.currentAgentStatus = 'offline'
      this.statusChangedAt = 0
      this.phoneState = 'idle'
      this.muted = false
      this.onHold = false
      this.currentCall = null
      this.popupVisible = false
      this.popupData = null
      this.todayCallCount = 0
      this.todayTalkSec = 0
    }
  }
})
