import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.student.inforadar',
  appName: 'AI Information Radar',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

