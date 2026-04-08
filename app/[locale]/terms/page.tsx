import { Header } from "@/components/layout/header"
import { getTranslations } from "next-intl/server"
import type { Locale } from "@/i18n/config"

export const runtime = "edge"

export default async function TermsPage({
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
          <h1 className="text-3xl font-bold mb-2">{t("terms.title")}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t("terms.lastUpdated")}</p>

          <div className="space-y-8 text-muted-foreground leading-7">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("terms.sections.acceptance.title")}</h2>
              <p>{t("terms.sections.acceptance.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("terms.sections.description.title")}</h2>
              <p>{t("terms.sections.description.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("terms.sections.prohibited.title")}</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t("terms.sections.prohibited.items.1")}</li>
                <li>{t("terms.sections.prohibited.items.2")}</li>
                <li>{t("terms.sections.prohibited.items.3")}</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("terms.sections.disclaimer.title")}</h2>
              <p>{t("terms.sections.disclaimer.content")}</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-2">{t("terms.sections.changes.title")}</h2>
              <p>{t("terms.sections.changes.content")}</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
