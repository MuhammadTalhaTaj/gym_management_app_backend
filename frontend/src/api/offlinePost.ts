// src/api/offlinePost.ts
import { addToOutbox } from '../db';

export type OfflinePayload = {
  method?: string;
  url: string;
  body?: any;
  headers?: Record<string, string>;
  createdAt: number;
};

export const sendOrQueue = async ({
  method = 'POST',
  url,
  body,
}: {
  method?: string;
  url: string;
  body?: any;
}) => {
  if (!url) {
    throw new Error('sendOrQueue: url is required');
  }

  const payload: OfflinePayload = {
    method,
    url,
    body,
    headers: { 'Content-Type': 'application/json' },
    createdAt: Date.now(),
  };

  // navigator may be undefined in some SSR/test environments
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (online) {
    try {
      const res = await fetch(url, {
        method,
        headers: payload.headers,
        body: typeof body === 'undefined' ? undefined : JSON.stringify(body),
      });

      if (!res.ok) {
        // queue on server error as well
        await addToOutbox(payload);
        return { offline: true };
      }

      // attempt to parse JSON safely
      try {
        return await res.json();
      } catch {
        return {};
      }
    } catch (err) {
      // network failed -> queue
      await addToOutbox(payload);
      return { offline: true };
    }
  } else {
    // offline: queue
    await addToOutbox(payload);
    return { offline: true };
  }
};
