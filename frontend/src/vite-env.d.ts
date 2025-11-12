/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_OAUTH_APP_ID: string
  readonly VITE_OAUTH_REDIRECT_URI: string
  readonly VITE_OAUTH_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
