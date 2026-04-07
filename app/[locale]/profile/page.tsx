import { Header } from "@/components/layout/header"
import { ProfileCard } from "@/components/profile/profile-card"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import type { Locale } from "@/i18n/config"

export const runtime = "edge"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeFromParams } = await params
  const locale = localeFromParams as Locale
  const session = await auth()
  
  if (!session?.user) {
    redirect(`/${locale}`)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_0%,hsl(var(--primary)/0.12)_0%,hsl(var(--muted)/0.36)_42%,hsl(var(--background))_74%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--background)/0.42)_0%,hsl(var(--background))_100%)]" />
      <div className="container mx-auto px-4 lg:px-8 max-w-[1600px] relative z-10">
        <Header />
        <main className="pt-20 pb-5">
          <ProfileCard user={session.user} />
        </main>
      </div>
    </div>
  )
}

