self.addEventListener("push", (event) => {
  const fallback = {
    title: "TianMail",
    body: "You have a new email.",
    url: "/",
  }

  const getPayload = async () => {
    if (event.data) {
      try {
        const data = event.data.json()
        return {
          title: data.title || fallback.title,
          body: data.body || fallback.body,
          url: data.url || fallback.url,
          messageId: data.messageId,
        }
      } catch {
        return fallback
      }
    }

    try {
      const response = await fetch("/api/push-subscriptions/latest", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })
      if (!response.ok) {
        return fallback
      }

      const latest = await response.json()
      return {
        title: latest.title || fallback.title,
        body: latest.body || fallback.body,
        url: latest.url || fallback.url,
        messageId: latest.messageId,
      }
    } catch {
      return fallback
    }
  }

  event.waitUntil(
    getPayload().then((payload) => self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: payload.messageId || "new-email",
      data: {
        url: payload.url,
      },
    })),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || "/"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      return clients.openWindow(targetUrl)
    }),
  )
})
