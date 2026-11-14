/**
 * Device-local MP3 storage (IndexedDB). Never uploaded, never served via public URL.
 */

const DB_NAME = "ami-lingua-sing-local";
const DB_VERSION = 1;
const STORE = "mp3";

export type LocalMp3Record = {
  songId: string;
  fileName: string;
  mimeType: string;
  blob: Blob;
  durationSec: number;
  importedAt: string;
  byteSize: number;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "songId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
  });
}

export async function saveLocalMp3(
  songId: string,
  file: File,
  durationSec = 0,
): Promise<LocalMp3Record> {
  const record: LocalMp3Record = {
    songId,
    fileName: file.name,
    mimeType: file.type || "audio/mpeg",
    blob: file,
    durationSec,
    importedAt: new Date().toISOString(),
    byteSize: file.size,
  };
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(record);
  await txDone(tx);
  db.close();
  return record;
}

export async function getLocalMp3(songId: string): Promise<LocalMp3Record | null> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get(songId);
  const row = await new Promise<LocalMp3Record | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as LocalMp3Record | undefined);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return row ?? null;
}

export async function hasLocalMp3(songId: string): Promise<boolean> {
  return Boolean(await getLocalMp3(songId));
}

export async function listLocalMp3Meta(): Promise<
  Omit<LocalMp3Record, "blob">[]
> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).getAll();
  const rows = await new Promise<LocalMp3Record[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as LocalMp3Record[]) || []);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return rows.map(({ blob: _b, ...meta }) => meta);
}

export async function deleteLocalMp3(songId: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(songId);
  await txDone(tx);
  db.close();
}

/** Create a temporary blob: URL — revoke when the player unmounts. */
export function createLocalObjectUrl(record: LocalMp3Record): string {
  return URL.createObjectURL(record.blob);
}

export function revokeLocalObjectUrl(url: string | null | undefined) {
  if (url && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* */
    }
  }
}

/** Probe duration from a File/Blob without uploading. */
export function probeAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "metadata";
    const done = (sec: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(sec) && sec > 0 ? sec : 0);
    };
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    audio.src = url;
  });
}
