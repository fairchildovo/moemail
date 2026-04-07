import { auth } from "@/lib/auth"
import { createDb } from "@/lib/db"
import { emails, messages } from "@/lib/schema"
import { and, desc, eq, ne, or, isNull } from "drizzle-orm"
import { i18n } from "@/i18n/config"

export const runtime = "edge"

function getLocaleFromCookie(request: Request) {
  const cookie = request.headers.get("cookie") || ""
  const localeMatch = cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1]
  if (localeMatch && i18n.locales.includes(localeMatch as any)) {
    return localeMatch
  }
  return i18n.defaultLocale
}

export async function GET(request: Request) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = createDb()
  const latest = await db
    .select({
      messageId: messages.id,
      subject: messages.subject,
      fromAddress: messages.fromAddress,
      toAddress: emails.address,
    })
    .from(messages)
    .innerJoin(emails, eq(messages.emailId, emails.id))
    .where(and(
      eq(emails.userId, userId),
      or(
        ne(messages.type, "sent"),
        isNull(messages.type),
      ),
    ))
    .orderBy(desc(messages.receivedAt), desc(messages.id))
    .limit(1)

  if (!latest.length) {
    return Response.json({
      title: "TianMail",
      body: "You have a new email.",
      url: `/${getLocaleFromCookie(request)}/moe`,
    })
  }

  const row = latest[0]
  const sender = row.fromAddress || "Unknown sender"
  const subject = row.subject || "(No Subject)"
  const locale = getLocaleFromCookie(request)

  return Response.json({
    title: "New Email",
    body: `${sender}: ${subject}`,
    messageId: row.messageId,
    url: `/${locale}/moe`,
    toAddress: row.toAddress,
  })
}
