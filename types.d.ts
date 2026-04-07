/// <reference types="@cloudflare/workers-types" />


declare global {
  interface CloudflareEnv {
    DB: D1Database;
    SITE_CONFIG: KVNamespace;
    WEB_PUSH_VAPID_SUBJECT?: string;
    WEB_PUSH_VAPID_PUBLIC_KEY?: string;
    WEB_PUSH_VAPID_PRIVATE_JWK?: string;
  }

  interface Window {
    turnstile?: {
      render: (element: HTMLElement | string, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }

  type Env = CloudflareEnv
}

declare module "next-auth" {
  interface User {
    roles?: { name: string }[]
    username?: string | null
    providers?: string[]
  }

  interface Session {
    user: User
  }
}

export type { Env }
