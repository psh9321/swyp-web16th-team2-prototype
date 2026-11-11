import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  define: { 'import.meta.env.VITE_KAKAO_MAP_JAVASCRIPT_KEY': JSON.stringify(env.VITE_KAKAO_MAP_JAVASCRIPT_KEY || env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || env.KAKAO_JAVASCRIPT_KEY || '') },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  }
})
