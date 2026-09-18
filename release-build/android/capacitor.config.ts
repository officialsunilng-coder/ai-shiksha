import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.shikshaai.granitelite',
  appName: 'ShikshaAI Granite Lite',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
}

export default config
