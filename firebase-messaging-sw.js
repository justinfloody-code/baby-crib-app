// Crib — Firebase Cloud Messaging service worker.
//
// This file MUST live at the root of the site (same folder as index.html) and MUST be named
// exactly "firebase-messaging-sw.js" — Firebase's client SDK looks for it at that exact path by
// default when you call getToken()/onMessage() without passing a custom serviceWorkerRegistration.
//
// A service worker is its own separate script context (no access to the page's DOM, state, or
// the rest of Crib's code) — this is why it can't just be inlined into the main HTML file, and
// why it re-declares its own tiny copy of the Firebase config.
//
// What this file does: when a push notification arrives while the Crib tab isn't open/focused,
// the browser wakes this service worker up just long enough to hand it the message, and
// onBackgroundMessage() below turns that into an actual visible notification. If the tab IS open
// and focused, Firebase delivers the message straight to the page instead (see the onMessage()
// handler in the main HTML file) and this file is never involved.

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Same values as firebaseConfig in the main HTML file. Messaging only actually needs
// messagingSenderId + appId + projectId to work, but the rest is harmless to include.
firebase.initializeApp({
  apiKey: "AIzaSyA35YbanaPUGp3Dg2iDg-OcdXb4LDXUZ58",
  authDomain: "baby-app-1f851.firebaseapp.com",
  databaseURL: "https://baby-app-1f851-default-rtdb.firebaseio.com",
  projectId: "baby-app-1f851",
  storageBucket: "baby-app-1f851.firebasestorage.app",
  messagingSenderId: "165438769173",
  appId: "1:165438769173:web:53aedd16bfa586e485a61c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'Crib';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    // Tapping the notification should just bring an existing Crib tab to the front (or open one)
    // rather than stacking duplicate tabs — handled in the notificationclick listener below.
    data: { url: (payload.data && payload.data.url) || './index.html' }
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
