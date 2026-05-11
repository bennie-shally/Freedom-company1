importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDrh8GJzIbV7OsSEqO2wXVaiYAz_UKBO9w",
  authDomain: "freedom-company-63a44.firebaseapp.com",
  projectId: "freedom-company-63a44",
  storageBucket: "freedom-company-63a44.firebasestorage.app",
  messagingSenderId: "164186684001",
  appId: "1:164186684001:web:fa8202168207ee70a20820"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message from a client.',
    icon: '/logo.png', // Fallback to a logo if exists
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
