<template lang="html">
  <transition name="overlay">
    <div class="overlay" :class="{ transparent }" v-if="show">
      <slot />
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    show: Boolean,
    transparent: Boolean,
  },
}
</script>

<style lang="css" scoped>
.overlay {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background);
  z-index: 10;
  transition: all 0.2s;
}

.transparent {
  background: rgba(var(--background-rgb), 0.6);
}

.overlay-enter,
.overlay-leave-to {
  opacity: 0;
}

.overlay-fade-in {
  opacity: 1;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.5s;
}

.overlay-enter,
.overlay-leave-to {
  opacity: 0;
}
</style>
