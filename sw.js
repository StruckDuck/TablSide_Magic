// TablSide service worker.
// This runs in the background, separately from the admin page itself, which
// is what lets a notification arrive even when the page isn't open.

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Shows the actual notification when a push arrives. The server-side piece
// that sends the push isn't built yet — this is the receiving half only.
self.addEventListener('push', function(event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}

  var title = data.title || 'TablSide';
  var options = {
    body: data.body || 'You have a new table request.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: data.url || './admin.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping the notification brings an already-open admin tab to the front,
// or opens a new one if there isn't one.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './admin.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url.indexOf('admin.html') > -1 && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
