// src/api/offlinePost.js
import { addToOutbox } from '../db';

export const sendOrQueue = async ({ method = 'POST', url, body }) => {
  const payload = { method, url, body, headers: { 'Content-Type': 'application/json' }, createdAt: Date.now() };

  if (navigator.onLine) {
    // attempt network send
    try {
      const res = await fetch(url, {
        method,
        headers: payload.headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (err) {
      // network failed. queue for later
      await addToOutbox(payload);
      return { offline: true };
    }
  } else {
    // offline: queue and return immediate optimistic response if desired
    await addToOutbox(payload);
    return { offline: true };
  }
};
