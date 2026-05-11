import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { messaging, db, auth } from '../lib/firebase';

const VAPID_KEY = 'BDIxMeH3y48AvCYSQO_0TmjJZZTRssi-B7X8OWt87qXG5P5QxwAjbmfjpDjdd1PX5Ih9zHpnrrgoPMnDDP0MosM';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (typeof window === 'undefined') return;

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        await registerToken();
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const registerToken = async () => {
    if (!messaging || !auth.currentUser) return;

    try {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        setFcmToken(token);
        // Save token to user profile
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          fcmToken: token,
          lastTokenSync: new Date().toISOString()
        });
        console.log('FCM Token registered and saved:', token);
      } else {
        console.warn('No registration token available. Request permission to generate one.');
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Listen for foreground messages
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        // Show a browser notification manually if in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Message', {
            body: payload.notification?.body || 'You have a new message.',
            icon: '/logo.png'
          });
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Automatically attempt to register token if permission is already granted
  useEffect(() => {
    if (notificationPermission === 'granted' && auth.currentUser) {
      registerToken();
    }
  }, [notificationPermission, auth.currentUser]);

  return {
    fcmToken,
    notificationPermission,
    requestPermission,
  };
};
