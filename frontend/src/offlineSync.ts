// src/api/offlineSync.ts
import { getOutboxItems, removeOutboxItem } from './db';

export async function syncOutbox() {
  try {
    const items = await getOutboxItems();

    if (!items || items.length === 0) return;

    for (const item of items) {
      // make sure required fields exist
      if (!item || typeof item.url !== 'string' || item.url.trim() === '') {
        // invalid item — remove it to avoid infinite loops
        if (typeof item.id !== 'undefined' && item.id !== null) {
          await removeOutboxItem(item.id);
        }
        continue;
      }

      try {
        const res = await fetch(item.url, {
          method: item.method ?? 'POST',
          headers: item.headers ?? { 'Content-Type': 'application/json' },
          body: typeof item.body === 'undefined' ? undefined : JSON.stringify(item.body),
        });

        // on success remove from outbox
        if (res.ok) {
          if (typeof item.id !== 'undefined' && item.id !== null) {
            await removeOutboxItem(item.id);
          }
        } else {
          // keep it in outbox, maybe will retry later
          // but if server returns 4xx that will likely never succeed.
          // we don't automatically delete here.
          // eslint-disable-next-line no-console
          console.warn('syncOutbox: failed to POST outbox item', res.status, item.url);
        }
      } catch (err) {
        // network error -> keep item for next attempt
        // eslint-disable-next-line no-console
        console.warn('syncOutbox: network error while sending outbox item', err);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('syncOutbox: failed', err);
  }
}
