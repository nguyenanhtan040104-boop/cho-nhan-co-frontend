'use client';
import { useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.chonhanco.com/api';
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function usePushNotification() {
  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        if (Notification.permission === 'denied') return;
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
        }

        const existing = await reg.pushManager.getSubscription();
        if (existing) return; // already subscribed

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await fetch(`${API}/push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(sub),
        });
      } catch (e) {
        // Push not supported or failed — silently ignore
      }
    }
    setup();
  }, []);
}
