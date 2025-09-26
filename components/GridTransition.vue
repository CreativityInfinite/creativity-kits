<template>
  <TransitionGroup tag="div" name="grid" appear>
    <slot />
  </TransitionGroup>
</template>

<style scoped>
.grid-enter-active,
.grid-leave-active {
  transition: all 0.3s ease;
}
.grid-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
.grid-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.grid-leave-from {
  opacity: 1;
  transform: scale(1);
}
.grid-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
