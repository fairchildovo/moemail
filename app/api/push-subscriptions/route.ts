import { auth } from "@/lib/auth"
import { createDb } from "@/lib/db"
import { pushSubscriptions } from "@/lib/schema"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

export const runtime = "edge"

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().optional(),
    auth: z.string().optional(),
  }).optional(),
})

const saveSchema = z.object({
  subscription: subscriptionSchema,
})

const deleteSchema = z.object({
  endpoint: z.string().url().optional(),
})

async function getUserId() {
  const session = await auth()
  return session?.user?.id || null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = createDb()
  const subscriptions = await db.query.pushSubscriptions.findMany({
    where: and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.enabled, true),
    ),
  })

  return Response.json({
    subscribed: subscriptions.length > 0,
    count: subscriptions.length,
  })
}

export async function POST(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { subscription } = saveSchema.parse(body)

    const db = createDb()
    const now = new Date()
    const existing = await db.query.pushSubscriptions.findFirst({
      where: eq(pushSubscriptions.endpoint, subscription.endpoint),
    })

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({
          userId,
          subscription: JSON.stringify(subscription),
          enabled: true,
          updatedAt: now,
          lastError: null,
        })
        .where(eq(pushSubscriptions.id, existing.id))
    } else {
      await db.insert(pushSubscriptions).values({
        userId,
        endpoint: subscription.endpoint,
        subscription: JSON.stringify(subscription),
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to save push subscription:", error)
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const endpoint = url.searchParams.get("endpoint") || undefined
    const parsed = deleteSchema.parse({ endpoint })
    const db = createDb()

    if (parsed.endpoint) {
      await db
        .delete(pushSubscriptions)
        .where(and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.endpoint, parsed.endpoint),
        ))
    } else {
      await db
        .delete(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId))
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Failed to remove push subscription:", error)
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
