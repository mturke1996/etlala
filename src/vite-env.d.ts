/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** مفتاح VAPID من Firebase Console → Cloud Messaging → Web Push */
  readonly VITE_FCM_VAPID_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.css';

declare module '*.ttf' {
  const value: string;
  export default value;
}

declare module '*.otf' {
  const value: string;
  export default value;
}
