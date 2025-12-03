// src/db.ts
import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

const DB_NAME = 'gym_management_app_db';
const DB_VERSION = 1;
const OUTBOX_STORE = 'outbox';
const CACHE_STORE = 'cache';

let _dbPromise: Promise<IDBPDatabase<any>> | null = null;

function getDB() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
          db.createObjectStore(OUTBOX_STORE, { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE);
        }
      },
    });
  }
  return _dbPromise;
}

export async function addToOutbox(payload: any) {
  const db = await getDB();
  return db.add(OUTBOX_STORE, payload);
}

export async function getOutboxItems() {
  const db = await getDB();
  return db.getAll(OUTBOX_STORE);
}

export async function removeOutboxItem(id?: IDBValidKey) {
  if (typeof id === 'undefined' || id === null) return;
  const db = await getDB();
  return db.delete(OUTBOX_STORE, id);
}

export async function saveToCache(key: string, value: any) {
  const db = await getDB();
  return db.put(CACHE_STORE, value, key);
}

export async function readFromCache(key: string) {
  const db = await getDB();
  return db.get(CACHE_STORE, key);
}
