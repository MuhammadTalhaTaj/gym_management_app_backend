// src/db.js
import { openDB } from 'idb';

const DB_NAME = 'gym-db';
const DB_VERSION = 1;
const CACHE_STORE = 'cache';   // store API responses keyed by endpoint
const OUTBOX_STORE = 'outbox'; // store queued writes

export const getDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CACHE_STORE))
        db.createObjectStore(CACHE_STORE);
      if (!db.objectStoreNames.contains(OUTBOX_STORE))
        db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true });
    },
  });
};

// cache helpers
export const saveToCache = async (key, data) => {
  const db = await getDB();
  await db.put(CACHE_STORE, { data, updatedAt: Date.now() }, key);
};

export const readFromCache = async (key) => {
  const db = await getDB();
  const rec = await db.get(CACHE_STORE, key);
  return rec?.data ?? null;
};

// outbox helpers
export const addToOutbox = async (payload) => {
  const db = await getDB();
  // payload example: { method: 'POST', url: '/api/member', body: {...}, headers: {...}, createdAt: Date.now() }
  await db.add(OUTBOX_STORE, payload);
};

export const getOutboxItems = async () => {
  const db = await getDB();
  return await db.getAll(OUTBOX_STORE);
};

export const removeOutboxItem = async (id) => {
  const db = await getDB();
  return await db.delete(OUTBOX_STORE, id);
};
