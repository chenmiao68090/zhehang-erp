<template>
  <Transition name="mask-fade">
    <div v-if="loading" class="loading-mask">
      <div class="loading-mask__content">
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <p v-if="text" class="loading-mask__text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '',
})
</script>

<style scoped>
.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.7);
  border-radius: inherit;
  backdrop-filter: blur(2px);
}

.loading-mask__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #D4AF37;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-mask__text {
  font-size: 12px;
  color: #8B8B9A;
  margin: 0;
}

/* Transition */
.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.3s ease;
}

.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}
</style>
