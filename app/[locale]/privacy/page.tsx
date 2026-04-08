import { Header } from "@/components/layout/header"
import { getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"

export const runtime = "edge"

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeFromParams } = await params
  const locale = localeFromParams as Locale
  const t = await getTranslations({ locale, namespace: "home" })

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">{t("privacy.title")}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t("privacy.lastUpdated")}</p>

          <div className="space-y-8 text-muted-foreground leading-7">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("privacy.sections.introduction.title")}</h2>
              <p>{t("privacy.sections.introduction.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("privacy.sections.collection.title")}</h2>
              <p>{t("privacy.sections.collection.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("privacy.sections.emailContent.title")}</h2>
              <p>{t("privacy.sections.emailContent.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("privacy.sections.thirdParty.title")}</h2>
              <p>{t("privacy.sections.thirdParty.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("privacy.sections.contact.title")}</h2>
              <p>{t("privacy.sections.contact.content")}</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
