<template>
  <div class='error-page'>
    <div class='error-page__noise' aria-hidden='true'></div>
    <div class='error-page__glow' aria-hidden='true'></div>
    <div class='error-page__scan' aria-hidden='true'></div>

    <div class='error-page__frame'>
      <span class='error-page__corner error-page__corner--tl'></span>
      <span class='error-page__corner error-page__corner--tr'></span>
      <span class='error-page__corner error-page__corner--bl'></span>
      <span class='error-page__corner error-page__corner--br'></span>

      <div class='error-page__eyebrow'>
        <span class='error-page__line'></span>
        <span class='error-page__eyebrow-text'>ZHEHANG · SYSTEM ALERT</span>
        <span class='error-page__line'></span>
      </div>

      <h1 class='error-page__code'>
        <span class='error-page__digit error-page__digit--accent' style='--i:0'>5</span>
        <span class='error-page__digit' style='--i:1'>0</span>
        <span class='error-page__digit' style='--i:2'>0</span>
      </h1>

      <p class='error-page__title'>系统错误，请稍后重试</p>
      <p class='error-page__subtitle'>
        Internal Server Error · 服务器暂时无法处理请求，技术团队已收到通知
      </p>

      <div class='error-page__actions'>
        <button type='button' class='error-page__btn' @click='goHome'>
          <span class='error-page__btn-text'>返回首页</span>
          <span class='error-page__btn-arrow' aria-hidden='true'>→</span>
        </button>
        <button type='button' class='error-page__btn error-page__btn--ghost' @click='reload'>
          <span class='error-page__btn-text'>重新加载</span>
        </button>
      </div>

      <div class='error-page__meta'>
        <span>STATUS · 500</span>
        <span class='error-page__dot'></span>
        <span>ZHEHANG ERP SYSTEM</span>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const reload = () => {
  window.location.reload()
}
</script>

<style scoped>
.error-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(ellipse at 30% 70%, rgba(51, 112, 255, 0.08), transparent 55%),
    radial-gradient(ellipse at 70% 30%, rgba(180, 60, 60, 0.06), transparent 60%),
    #16161E;
  color: #E0E0E0;
  font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.error-page__noise {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.012) 0px,
      rgba(255, 255, 255, 0.012) 1px,
      transparent 1px,
      transparent 3px
    );
  mix-blend-mode: overlay;
}

.error-page__glow {
  position: absolute;
  width: 720px;
  height: 720px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(51, 112, 255, 0.16) 0%, transparent 70%);
  filter: blur(40px);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: pulse 5s ease-in-out infinite;
}

.error-page__scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(51, 112, 255, 0.04) 50%,
    transparent 100%
  );
  animation: scan 6s linear infinite;
}

@keyframes scan {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
}

.error-page__frame {
  position: relative;
  padding: 72px 96px;
  text-align: center;
  max-width: 720px;
  width: calc(100% - 64px);
  z-index: 1;
}

.error-page__corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 1px solid #3370ff;
}
.error-page__corner--tl { top: 0; left: 0; border-right: none; border-bottom: none; }
.error-page__corner--tr { top: 0; right: 0; border-left: none; border-bottom: none; }
.error-page__corner--bl { bottom: 0; left: 0; border-right: none; border-top: none; }
.error-page__corner--br { bottom: 0; right: 0; border-left: none; border-top: none; }

.error-page__eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 36px;
  opacity: 0;
  animation: fadeUp 0.7s ease-out 0.1s forwards;
}

.error-page__line {
  width: 48px;
  height: 1px;
  background: linear-gradient(to right, transparent, #3370ff, transparent);
}

.error-page__eyebrow-text {
  font-size: 11px;
  letter-spacing: 0.4em;
  color: #3370ff;
  font-weight: 500;
}

.error-page__code {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
  margin: 0 0 32px 0;
  font-family: 'Didot', 'Bodoni 72', 'Times New Roman', serif;
  font-weight: 300;
  font-size: clamp(120px, 18vw, 200px);
  line-height: 1;
  letter-spacing: -0.04em;
}

.error-page__digit {
  display: inline-block;
  background: linear-gradient(180deg, #F0F0F0 0%, #E0E0E0 40%, #8a8a92 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  opacity: 0;
  transform: translateY(20px);
  animation: digitIn 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
  animation-delay: calc(0.25s + var(--i) * 0.12s);
  text-shadow: 0 2px 24px rgba(255, 255, 255, 0.04);
}

.error-page__digit--accent {
  background: linear-gradient(180deg, #F4D87A 0%, #3370ff 50%, #8a6f1f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes digitIn {
  to { opacity: 1; transform: translateY(0); }
}

.error-page__title {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.06em;
  color: #E0E0E0;
  opacity: 0;
  animation: fadeUp 0.7s ease-out 0.7s forwards;
}

.error-page__subtitle {
  margin: 0 0 48px 0;
  font-size: 13px;
  color: #8a8a92;
  letter-spacing: 0.05em;
  opacity: 0;
  animation: fadeUp 0.7s ease-out 0.85s forwards;
}

.error-page__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 56px;
  opacity: 0;
  animation: fadeUp 0.7s ease-out 1s forwards;
}

.error-page__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 32px;
  background: linear-gradient(180deg, #3370ff 0%, #b8932a 100%);
  border: 1px solid #3370ff;
  color: #16161E;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
  font-family: inherit;
  overflow: hidden;
}

.error-page__btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #F4D87A 0%, #3370ff 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.error-page__btn:hover::before { opacity: 1; }
.error-page__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(51, 112, 255, 0.3);
}

.error-page__btn-text,
.error-page__btn-arrow {
  position: relative;
  z-index: 1;
}

.error-page__btn-arrow {
  transition: transform 0.3s;
}

.error-page__btn:hover .error-page__btn-arrow {
  transform: translateX(4px);
}

.error-page__btn--ghost {
  background: transparent;
  border: 1px solid rgba(51, 112, 255, 0.4);
  color: #3370ff;
}

.error-page__btn--ghost::before { display: none; }

.error-page__btn--ghost:hover {
  border-color: #3370ff;
  background: rgba(51, 112, 255, 0.08);
  box-shadow: none;
}

.error-page__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: #555560;
  opacity: 0;
  animation: fadeUp 0.7s ease-out 1.15s forwards;
}

.error-page__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3370ff;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .error-page__frame { padding: 48px 32px; }
  .error-page__actions { flex-direction: column; align-items: stretch; }
  .error-page__eyebrow-text { font-size: 10px; }
}
</style>
