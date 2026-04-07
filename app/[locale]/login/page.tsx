import { LoginForm } from "@/components/auth/login-form"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Locale } from "@/i18n/config"
import { getTurnstileConfig } from "@/lib/turnstile"

export const runtime = "edge"

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeFromParams } = await params
  const locale = localeFromParams as Locale
  const session = await auth()
  
  if (session?.user) {
    redirect(`/${locale}`)
  }

  const turnstile = await getTurnstileConfig()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_0%,hsl(var(--primary)/0.12)_0%,hsl(var(--muted)/0.36)_42%,hsl(var(--background))_74%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--background)/0.42)_0%,hsl(var(--background))_100%)]" />
      <div className="relative z-10">
        <LoginForm turnstile={{ enabled: turnstile.enabled, siteKey: turnstile.siteKey }} />
      </div>
    </div>
  )
}
