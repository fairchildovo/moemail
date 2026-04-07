self.addEventListener("push", (event) => {
  const fallback = {
    title: "TianMail",
    body: "You have a new email.",
    url: "/",
  }

  let payload = fallback
  if (event.data) {
    try {
      const data = event.data.json()
      payload = {
        title: data.title || fallback.title,
        body: data.body || fallback.body,
        url: data.url || fallback.url,
      }
    } catch {
      payload = fallback
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: {
        url: payload.url,
      },
    }),
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
