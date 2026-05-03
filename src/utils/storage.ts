import {
  APP_VERSION,
  LEGACY_STORAGE_KEY,
  PREVIOUS_REACT_STORAGE_KEY,
  STORAGE_KEY,
  buildDefaultData,
  migrateAnyData,
  migratePreviousReactData,
  normalizeAppData
} from "../data/defaultData";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { AppData, ClosetGroupKey, PreviousReactAppData, SharedState } from "@/types";
import { normalizeClosetGroupKey } from "@/utils/wardrobe";

const DB_NAME = "nanjiang-wardrobe-db";
const DB_VERSION = 1;
const SNAPSHOT_STORE = "snapshots";
const SNAPSHOT_KEY = "app-data";
const CATEGORY_GROUPS_KEY = "nanjiang-wardrobe-category-groups-v1";
const REMOTE_SLUG = "default";

export async function loadInitialData(userId?: string): Promise<{ data: AppData; shared: SharedState }> {
  const shared = buildSharedState(userId);

  if (userId && isSupabaseConfigured && supabase) {
    const remoteData = await loadRemoteSnapshot(userId);
    if (remoteData) {
      await saveLocalCopy(remoteData);
      return { data: remoteData, shared };
    }
  }

  const indexedSnapshot = await readIndexedSnapshot();
  if (indexedSnapshot) {
    return { data: normalizeAppData(migrateAnyData(indexedSnapshot)), shared };
  }

  const local = readStorage(STORAGE_KEY);
  if (local) {
    const data = normalizeAppData(migrateAnyData(local));
    await saveLocalCopy(data);
    return { data, shared };
  }

  const previousReact = readStorage(PREVIOUS_REACT_STORAGE_KEY);
  if (previousReact) {
    const data = migratePreviousReactData(previousReact as PreviousReactAppData);
    await saveLocalCopy(data);
    return { data, shared };
  }

  const legacy = readStorage(LEGACY_STORAGE_KEY);
  if (legacy) {
    const data = normalizeAppData(migrateAnyData(legacy));
    await saveLocalCopy(data);
    return { data, shared };
  }

  const fallback = buildDefaultData();
  await saveLocalCopy(fallback);
  return { data: fallback, shared };
}

export async function saveData(data: AppData, shared: SharedState, userId?: string) {
  const normalized = normalizeAppData({
    ...data,
    version: APP_VERSION,
    updatedAt: new Date().toISOString()
  });

  await saveLocalCopy(normalized);

  if (!userId || !shared.enabled || !isSupabaseConfigured || !supabase) {
    return normalized;
  }

  const { error } = await supabase.from("wardrobe_snapshots").upsert(
    {
      user_id: userId,
      slug: REMOTE_SLUG,
      data: normalized,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "user_id,slug"
    }
  );

  if (error) {
    throw new Error(error.message || "云端同步失败，但本地副本已经更新。");
  }

  return normalized;
}

export function importData(rawText: string) {
  return normalizeAppData(migrateAnyData(JSON.parse(rawText)));
}

export function exportData(data: AppData) {
  const blob = new Blob([JSON.stringify(normalizeAppData(data), null, 2)], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "wardrobe-library.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function saveLocalCopy(data: AppData) {
  await writeIndexedSnapshot(data);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("localStorage snapshot skipped:", error);
  }
}

export function loadCategoryGroups() {
  try {
    const raw = localStorage.getItem(CATEGORY_GROUPS_KEY);
    if (!raw) return {} as Partial<Record<string, ClosetGroupKey>>;
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.entries(parsed).reduce<Partial<Record<string, ClosetGroupKey>>>((result, [category, group]) => {
      if (!category.trim()) return result;
      result[category] = normalizeClosetGroupKey(group);
      return result;
    }, {});
  } catch (error) {
    console.error(error);
    return {} as Partial<Record<string, ClosetGroupKey>>;
  }
}

export function saveCategoryGroups(groups: Partial<Record<string, ClosetGroupKey>>) {
  const normalizedGroups = Object.entries(groups).reduce<Partial<Record<string, ClosetGroupKey>>>((result, [category, group]) => {
    if (!category.trim()) return result;
    result[category] = normalizeClosetGroupKey(group);
    return result;
  }, {});
  localStorage.setItem(CATEGORY_GROUPS_KEY, JSON.stringify(normalizedGroups));
}

export function buildSharedState(userId?: string): SharedState {
  if (!userId || !isSupabaseConfigured) {
    return {
      enabled: false,
      authRequired: isSupabaseConfigured,
      dataFile: "",
      originLabel: isSupabaseConfigured ? "Supabase" : "Local"
    };
  }

  return {
    enabled: true,
    authRequired: true,
    dataFile: "wardrobe_snapshots/default",
    originLabel: "Supabase"
  };
}

async function loadRemoteSnapshot(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("wardrobe_snapshots")
    .select("data")
    .eq("user_id", userId)
    .eq("slug", REMOTE_SLUG)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  if (!data?.data) return null;
  return normalizeAppData(migrateAnyData(data.data));
}

function readStorage(key: string) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function readIndexedSnapshot() {
  if (!("indexedDB" in window)) return null;

  try {
    const db = await openDatabase();
    return await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction(SNAPSHOT_STORE, "readonly");
      const store = transaction.objectStore(SNAPSHOT_STORE);
      const request = store.get(SNAPSHOT_KEY);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function writeIndexedSnapshot(data: AppData) {
  if (!("indexedDB" in window)) return;

  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(SNAPSHOT_STORE, "readwrite");
    const store = transaction.objectStore(SNAPSHOT_STORE);
    store.put(data, SNAPSHOT_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function openDatabase() {
  return await new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SNAPSHOT_STORE)) {
        db.createObjectStore(SNAPSHOT_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
