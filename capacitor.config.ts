import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ahcer.app',
  appName: 'Ahcer Episode Recorder',
  webDir: 'dist/ahcer',
  server: { 
    androidScheme: 'https'
  },
  plugins:{
    GoogleAuth:{
      scopes:[
        "profile",
        "email"
      ],
      // serverClientId:"969476341146-s84rvq06t5jshm4fil253dih039v706o.apps.googleusercontent.com",
      // serverClientId:"969476341146-ucidhf9esh2jld1f4qfhi1o36cde1e32.apps.googleusercontent.com",
      androidClientId :"969476341146-s84rvq06t5jshm4fil253dih039v706o.apps.googleusercontent.com",
      forceCodeForRefreshToken:true
    }
  }
};

export default config;
