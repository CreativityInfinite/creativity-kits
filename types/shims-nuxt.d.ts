// Temporary shims to satisfy editor/TS until .nuxt types are generated at runtime
declare module '#imports' {
  // Re-export common Vue types to help tooling
  export * from 'vue'
  // Nuxt auto-imported composables (loose typing to avoid false errors in editor)
  export const useI18n: any
  export const useAsyncData: any
  export const definePageMeta: any
  export const useColorMode: any
}
