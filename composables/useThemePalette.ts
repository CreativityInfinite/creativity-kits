import { onMounted, ref, watch } from 'vue'
import { useColorMode } from '#imports'

const KEY_THEME = 'ft_theme'
const KEY_MODE = 'ft_mode'

export function useThemePalette() {
  const theme = ref<string>('cool-blue')
  const mode = ref<'light' | 'dark' | 'system'>('system')
  const colorMode = useColorMode()

  function applyTheme(t: string) {
    theme.value = t
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(KEY_THEME, t)
  }

  function applyMode(m: 'light' | 'dark' | 'system') {
    mode.value = m
    colorMode.preference = m
    localStorage.setItem(KEY_MODE, m)
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem(KEY_THEME)
    const savedMode = (localStorage.getItem(KEY_MODE) as 'light' | 'dark' | 'system' | null) || null
    applyTheme(savedTheme || theme.value)
    applyMode(savedMode || mode.value)
  })

  // 变更即应用（SSR 安全：仅在 mounted 后会生效于 DOM）
  watch(theme, (t) => {
    if (typeof window !== 'undefined') applyTheme(t)
  })
  watch(mode, (m) => {
    if (typeof window !== 'undefined') applyMode(m)
  })

  return {
    theme,
    mode,
    setTheme: applyTheme,
    setMode: applyMode
  }
}
