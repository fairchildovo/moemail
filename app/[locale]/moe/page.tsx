import { Header } from "@/components/layout/header"
import { ThreeColumnLayout } from "@/components/emails/three-column-layout"
import { NoPermissionDialog } from "@/components/no-permission-dialog"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { checkPermission } from "@/lib/auth"
import { PERMISSIONS } from "@/lib/permissions"
import type { Locale } from "@/i18n/config"

export const runtime = "edge"

export default async function MoePage({
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

  const hasPermission = await checkPermission(PERMISSIONS.MANAGE_EMAIL)

  return (
    <div className="bg-background h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_50%_0%,hsl(var(--primary)/0.12)_0%,hsl(var(--muted)/0.36)_42%,hsl(var(--background))_74%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,hsl(var(--background)/0.42)_0%,hsl(var(--background))_100%)]" />
      <div className="container mx-auto h-full px-4 lg:px-8 max-w-[1600px] relative z-10">
        <Header />
        <main className="h-full">
          <ThreeColumnLayout />
          {!hasPermission && <NoPermissionDialog />}
        </main>
      </div>
    </div>
  )
}

