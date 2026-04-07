import { readVapidConfig } from "@/lib/push"
import { getRequestContext } from "@cloudflare/next-on-pages"

export const runtime = "edge"

export async function GET() {
  const vapid = readVapidConfig(getRequestContext().env)

  if (!vapid) {
    return Response.json({ error: "Web Push is not configured" }, { status: 503 })
  }

  return Response.json({ publicKey: vapid.publicKey })
}
