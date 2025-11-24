// src/offlineSync.js
import { getOutboxItems, removeOutboxItem } from './db';

export async function syncOutboxToServer() {
  const items = await getOutboxItems();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: JSON.stringify(item.body),
      });
      if (res.ok) {
        // remove from outbox
        await removeOutboxItem(item.id);
      } else {
        console.warn('Server rejected outbox item', item.id, await res.text());
        // decide: remove or keep for later depending on status
      }
    } catch (err) {
      console.warn('Failed to sync item', item.id, err);
      // stop or continue based on your retry policy
    }
  }
}

// register in your app entry
if ('serviceWorker' in navigator) {
  window.addEventListener('online', () => {
    syncOutboxToServer();
  });
  // optional: call on startup too
  if (navigator.onLine) syncOutboxToServer();
}
