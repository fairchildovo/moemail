"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bell, BellOff, Send } from "lucide-react"

interface PushStatusResponse {
  subscribed: boolean
  count: number
}

interface PushTestResponse {
  success: number
  failed: number
  total: number
  reasons?: string[]
  error?: string
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4)
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  return Uint8Array.from(raw, (char) => char.charCodeAt(0))
}

export function PushNotificationConfig() {
  const t = useTranslations("profile.push")
  const tMessages = useTranslations("emails.messages")
  const { toast } = useToast()
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const permission = (() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported"
    }
    return Notification.permission
  })()

  useEffect(() => {
    const canUsePush = typeof window !== "undefined"
      && "Notification" in window
      && "serviceWorker" in navigator
      && "PushManager" in window

    setSupported(canUsePush)
    if (!canUsePush) {
      setLoading(false)
      return
    }

    fetch("/api/push-subscriptions")
      .then((res) => res.json() as Promise<PushStatusResponse>)
      .then((data) => {
        setSubscribed(Boolean(data.subscribed))
        setCount(data.count || 0)
      })
      .catch((error) => {
        console.error("Failed to fetch push subscription status:", error)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async () => {
    setSaving(true)
    try {
      const permissionState = await Notification.requestPermission()
      if (permissionState !== "granted") {
        toast({
          title: t("permissionDenied"),
          description: t("permissionDeniedDesc"),
          variant: "destructive",
        })
        return
      }

      const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" })
      const existing = await registration.pushManager.getSubscription()
      const publicKeyRes = await fetch("/api/push-subscriptions/public-key")
      if (!publicKeyRes.ok) {
        throw new Error(t("configMissing"))
      }
      const { publicKey } = await publicKeyRes.json() as { publicKey: string }
      const applicationServerKey = base64UrlToUint8Array(publicKey)
      const subscription = existing ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      const saveRes = await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      })

      if (!saveRes.ok) {
        throw new Error(t("subscribeFailed"))
      }

      setSubscribed(true)
      setCount(1)
      toast({
        title: t("subscribeSuccess"),
        description: t("subscribeSuccessDesc"),
      })
    } catch (error) {
      console.error("Failed to subscribe push:", error)
      toast({
        title: t("subscribeFailed"),
        description: t("subscribeFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleUnsubscribe = async () => {
    setSaving(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration("/")
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
      }

      const endpoint = subscription?.endpoint
      const url = endpoint
        ? `/api/push-subscriptions?endpoint=${encodeURIComponent(endpoint)}`
        : "/api/push-subscriptions"
      await fetch(url, { method: "DELETE" })

      setSubscribed(false)
      setCount(0)
      toast({
        title: t("unsubscribeSuccess"),
        description: t("unsubscribeSuccessDesc"),
      })
    } catch (error) {
      console.error("Failed to unsubscribe push:", error)
      toast({
        title: t("unsubscribeFailed"),
        description: t("unsubscribeFailedDesc"),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const res = await fetch("/api/push-subscriptions/test", {
        method: "POST",
      })
      const raw = await res.text()
      let data: PushTestResponse | null = null
      try {
        data = JSON.parse(raw) as PushTestResponse
      } catch {
        data = null
      }

      if (!data) {
        throw new Error(`HTTP ${res.status}: ${raw.slice(0, 120)}`)
      }

      if (!res.ok || data.success < 1) {
        const reason = data.error || data.reasons?.[0] || t("testFailedDesc")
        throw new Error(reason)
      }

      toast({
        title: t("testSuccess"),
        description: data.failed > 0
          ? `${t("testSuccessDesc")} (${data.success}/${data.total})`
          : t("testSuccessDesc"),
      })
    } catch (error) {
      console.error("Failed to send test push:", error)
      const reason = error instanceof Error ? error.message : t("testFailedDesc")
      toast({
        title: t("testFailed"),
        description: reason,
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{tMessages("loading")}</p>
      </div>
    )
  }

  if (!supported) {
    return (
      <div className="rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
        {t("unsupported")}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{t("title")}</Label>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="rounded-md border border-border p-3 space-y-2 text-sm">
        <p>
          {t("status")}: {subscribed ? t("subscribed") : t("notSubscribed")}
        </p>
        <p>
          {t("permission")}: {permission === "granted" ? t("granted") : permission === "denied" ? t("denied") : t("default")}
        </p>
        <p>
          {t("devices")}: {count}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {subscribed ? (
          <Button type="button" variant="outline" onClick={handleUnsubscribe} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
            <span className="ml-1">{t("unsubscribe")}</span>
          </Button>
        ) : (
          <Button type="button" onClick={handleSubscribe} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            <span className="ml-1">{t("subscribe")}</span>
          </Button>
        )}

        <Button type="button" variant="outline" onClick={handleTest} disabled={testing || !subscribed}>
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="ml-1">{t("test")}</span>
        </Button>
      </div>
    </div>
  )
}
