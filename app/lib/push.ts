export interface StoredPushSubscription {
  endpoint: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

export interface VapidConfig {
  subject: string
  publicKey: string
  privateJwk: JsonWebKey
}

export interface PushSendResult {
  ok: boolean
  status?: number
  shouldDelete: boolean
  error?: string
}

export interface VapidEnvLike {
  WEB_PUSH_VAPID_SUBJECT?: string
  WEB_PUSH_VAPID_PUBLIC_KEY?: string
  WEB_PUSH_VAPID_PRIVATE_JWK?: string
}

const MAX_VAPID_EXPIRES_SECONDS = 12 * 60 * 60

function toBase64Url(value: Uint8Array | ArrayBuffer | string): string {
  const bytes = typeof value === "string"
    ? new TextEncoder().encode(value)
    : value instanceof Uint8Array
      ? value
      : new Uint8Array(value)

  let binary = ""
  for (const b of bytes) {
    binary += String.fromCharCode(b)
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function derToJoseSignature(derBytes: Uint8Array, size: number): Uint8Array {
  if (derBytes.length < 8 || derBytes[0] !== 0x30) {
    throw new Error("Invalid DER signature format")
  }

  let offset = 2
  if (derBytes[1] & 0x80) {
    offset = 2 + (derBytes[1] & 0x7f)
  }

  if (derBytes[offset] !== 0x02) {
    throw new Error("Invalid DER signature format (r)")
  }
  const rLength = derBytes[offset + 1]
  const rStart = offset + 2
  const rEnd = rStart + rLength

  if (derBytes[rEnd] !== 0x02) {
    throw new Error("Invalid DER signature format (s)")
  }
  const sLength = derBytes[rEnd + 1]
  const sStart = rEnd + 2
  const sEnd = sStart + sLength

  const r = derBytes.slice(rStart, rEnd)
  const s = derBytes.slice(sStart, sEnd)

  const output = new Uint8Array(size * 2)
  output.set(r.slice(Math.max(0, r.length - size)), size - Math.min(size, r.length))
  output.set(s.slice(Math.max(0, s.length - size)), size * 2 - Math.min(size, s.length))
  return output
}

async function signJwt(payload: Record<string, unknown>, privateJwk: JsonWebKey): Promise<string> {
  const header = {
    alg: "ES256",
    typ: "JWT",
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    "jwk",
    privateJwk,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign"],
  )

  const derSignature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    key,
    new TextEncoder().encode(signingInput),
  )

  const joseSignature = derToJoseSignature(new Uint8Array(derSignature), 32)
  return `${signingInput}.${toBase64Url(joseSignature)}`
}

export function readVapidConfig(env: VapidEnvLike): VapidConfig | null {
  const subject = env.WEB_PUSH_VAPID_SUBJECT
  const publicKey = env.WEB_PUSH_VAPID_PUBLIC_KEY
  const privateJwkRaw = env.WEB_PUSH_VAPID_PRIVATE_JWK

  if (!subject || !publicKey || !privateJwkRaw) {
    return null
  }

  try {
    const privateJwk = JSON.parse(privateJwkRaw) as JsonWebKey
    if (!privateJwk.kty || !privateJwk.crv || !privateJwk.d || !privateJwk.x || !privateJwk.y) {
      return null
    }

    return {
      subject,
      publicKey,
      privateJwk,
    }
  } catch {
    return null
  }
}

export async function sendWebPushNotification(
  subscription: StoredPushSubscription,
  vapidConfig: VapidConfig,
): Promise<PushSendResult> {
  try {
    const endpointUrl = new URL(subscription.endpoint)
    const aud = `${endpointUrl.protocol}//${endpointUrl.host}`
    const exp = Math.floor(Date.now() / 1000) + MAX_VAPID_EXPIRES_SECONDS

    const jwt = await signJwt(
      {
        aud,
        exp,
        sub: vapidConfig.subject,
      },
      vapidConfig.privateJwk,
    )

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        TTL: "60",
        Authorization: `WebPush ${jwt}`,
        "Crypto-Key": `p256ecdsa=${vapidConfig.publicKey}`,
      },
    })

    if (response.ok) {
      return { ok: true, status: response.status, shouldDelete: false }
    }

    const shouldDelete = response.status === 404 || response.status === 410
    return {
      ok: false,
      status: response.status,
      shouldDelete,
      error: `Push gateway responded with ${response.status}`,
    }
  } catch (error) {
    return {
      ok: false,
      shouldDelete: false,
      error: error instanceof Error ? error.message : "Unknown push error",
    }
  }
}
