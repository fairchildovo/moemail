import { Header } from "@/components/layout/header"
import { auth } from "@/lib/auth"
import {
  Shield,
  Share2,
  Clock,
  Code2,
  MousePointerClick,
  RefreshCw,
  ArchiveX,
  Network,
  FileCode,
  ChevronDown,
} from "lucide-react"
import { ActionButton } from "@/components/home/action-button"
import { FeatureCard } from "@/components/home/feature-card"
import { getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"
import Link from "next/link"

export const runtime = "edge"

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeFromParams } = await params
  const locale = localeFromParams as Locale
  const session = await auth()
  const t = await getTranslations({ locale, namespace: "home" })

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-zinc-950 min-h-screen">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1600px]">
        <Header />
        <main className="pt-16">
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-2 relative overflow-hidden py-20">
            <div className="absolute inset-0 -z-10 bg-grid-primary/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full -z-10 animate-pulse" />

            <div className="w-full max-w-4xl mx-auto space-y-8 sm:space-y-12 py-4 relative z-10">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
                    {t("title")}
                  </span>
                </h1>
                <p className="text-lg sm:text-2xl text-muted-foreground tracking-wide max-w-2xl mx-auto leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 sm:px-0">
                <FeatureCard
                  icon={<Shield className="w-6 h-6" />}
                  title={t("features.privacy.title")}
                  description={t("features.privacy.description")}
                />
                <FeatureCard
                  icon={<Share2 className="w-6 h-6" />}
                  title={t("features.instant.title")}
                  description={t("features.instant.description")}
                />
                <FeatureCard
                  icon={<Clock className="w-6 h-6" />}
                  title={t("features.expiry.title")}
                  description={t("features.expiry.description")}
                />
                <FeatureCard
                  icon={<Code2 className="w-6 h-6" />}
                  title={t("features.openapi.title")}
                  description={t("features.openapi.description")}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2 sm:px-0">
                <ActionButton isLoggedIn={!!session} />
              </div>
            </div>
          </div>

          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-3xl font-bold text-center mb-12">{t("howToUse.title")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <MousePointerClick className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.register.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.register.description")}</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.create.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.create.description")}</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <ArchiveX className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.manage.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.manage.description")}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Network className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.webhook.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.webhook.description")}</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <FileCode className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.openapi.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.openapi.description")}</p>
                </div>
                <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl border border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Share2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold">{t("howToUse.steps.share.title")}</h3>
                  <p className="text-muted-foreground">{t("howToUse.steps.share.description")}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-4xl font-bold text-center mb-12">{t("faq.title")}</h2>
              <div className="bg-card w-full rounded-2xl border shadow-sm p-6 sm:p-10">
                <div className="w-full">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <details
                      key={item}
                      className="group border-b border-b-border/50 last:border-0 px-2"
                    >
                      <summary className="list-none flex items-center justify-between text-left py-6 text-lg font-medium hover:text-primary transition-colors cursor-pointer">
                        {t(`faq.items.${item}.question`)}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="pb-6 text-muted-foreground">{t(`faq.items.${item}.answer`)}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer className="py-8 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="text-center md:text-left">
              <h3 className="font-semibold">{t("footer.brand")}</h3>
              <p className="text-sm text-muted-foreground">{t("footer.copyright")}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-sm">
              <Link
                href={`/${locale}/privacy`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.policy.privacy")}
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.policy.terms")}
              </Link>
              <Link
                href="/api.html"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {t("footer.policy.openapi")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
  )
}

