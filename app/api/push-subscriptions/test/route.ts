import { auth } from "@/lib/auth"
import { createDb } from "@/lib/db"
import { readVapidConfig, sendWebPushNotification, StoredPushSubscription } from "@/lib/push"
import { pushSubscriptions } from "@/lib/schema"
import { getRequestContext } from "@cloudflare/next-on-pages"
import { and, eq } from "drizzle-orm"

export const runtime = "edge"

export async function POST() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const vapid = readVapidConfig(getRequestContext().env)
  if (!vapid) {
    return Response.json({ error: "Web Push is not configured" }, { status: 503 })
  }

  const db = createDb()
  const now = new Date()
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.enabled, true),
    ),
  })

  if (!subscriptions.length) {
    return Response.json({ error: "No active subscriptions" }, { status: 404 })
  }

  let success = 0
  let failed = 0
  for (const item of subscriptions) {
    let subscription: StoredPushSubscription
    try {
      subscription = JSON.parse(item.subscription) as StoredPushSubscription
    } catch {
      failed += 1
      await db
        .update(pushSubscriptions)
        .set({
          enabled: false,
          updatedAt: now,
          lastFailureAt: now,
          lastError: "Invalid subscription JSON",
        })
        .where(eq(pushSubscriptions.id, item.id))
      continue
    }

    const result = await sendWebPushNotification(subscription, vapid)
    if (result.ok) {
      success += 1
      await db
        .update(pushSubscriptions)
        .set({
          updatedAt: now,
          lastSuccessAt: now,
          lastError: null,
        })
        .where(eq(pushSubscriptions.id, item.id))
    } else {
      failed += 1
      await db
        .update(pushSubscriptions)
        .set({
          enabled: !result.shouldDelete,
          updatedAt: now,
          lastFailureAt: now,
          lastError: result.error ?? `Push failed${result.status ? ` (${result.status})` : ""}`,
        })
        .where(eq(pushSubscriptions.id, item.id))
    }
  }

  return Response.json({ success, failed, total: subscriptions.length })
}
