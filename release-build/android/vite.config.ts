import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['shikshaai-icon.png', 'shikshaai-logo.png', 'shikshaai-banner.png', 'models/**/*'],
      manifest: {
        name: 'ShikshaAI - Learn Anywhere',
        short_name: 'ShikshaAI',
        description: 'Private, offline-first learning for desktop and mobile.',
        theme_color: '#1c4944',
        background_color: '#f8f7f2',
        display: 'standalone',
        orientation: 'any',
        icons: [{ src: 'shikshaai-icon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
    }),
  ],
})
