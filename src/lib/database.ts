import { indexedImage } from "@/interfaces";
import { computeAverageHash } from "./pHash";
import { ImageRecord } from "@/interfaces";

const fileToImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });

const IMAGE_STORE = 'images';

export async function removeExistingIndexedDB() {
  const DB_NAME = 'ImagesDB';

  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadOrCreateIndexedDBBackupFile(rootDirHandle: FileSystemDirectoryHandle): Promise<IDBDatabase> {
  const DB_NAME = 'ImagesDB';
  const STORE_NAME = 'images';
  const BACKUP_FILE_NAME = 'images-indexeddb-backup.json';

  // Open or create the IndexedDB database
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'name' });

        store.createIndex("name", "name")
        store.createIndex("width", "width")
        store.createIndex("height", "height")
        store.createIndex("format", "format")
        store.createIndex("createdAt", "createdAt")
        store.createIndex("modifiedAt", "modifiedAt")
        store.createIndex("perceptualHash", "perceptualHash")
        store.createIndex("similarityOrder", "similarityOrder");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Try to get the backup file
  let backupFileHandle: FileSystemFileHandle;
  try {
    backupFileHandle = await rootDirHandle.getFileHandle(BACKUP_FILE_NAME, { create: false });
    const file = await backupFileHandle.getFile();
    const content = await file.text();
    const records = JSON.parse(content);

    if (!Array.isArray(records)) {
      throw new Error("Invalid backup format");
    }

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const record of records) {
      store.put(record);
    }
    await new Promise((res, rej) => {
      tx.oncomplete = () => res(null);
      tx.onerror = () => rej(tx.error);
    });

    console.log("IndexedDB loaded from existing backup.");
  } catch (err) {
    // If file does not exist, create an empty one
    backupFileHandle = await rootDirHandle.getFileHandle(BACKUP_FILE_NAME, { create: true });
    const writable = await backupFileHandle.createWritable();
    await writable.write("[]");
    await writable.close();
    console.log("No backup found. Created an empty backup file.", err);
  }

  return db;
}


function loadImage(file: File): Promise<[number, number, HTMLImageElement]> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve([img.width, img.height, img]);
      URL.revokeObjectURL(url);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function insertNewImagesIntoDatabase(
  imagesDirHandle: FileSystemDirectoryHandle,
  db: IDBDatabase
): Promise<void> {

  // Collect all file names first
  const images: [string, number, number, string][] = [];
  for await (const [name, fileHandle] of imagesDirHandle.entries()) {
    if (fileHandle.kind === "file") {

      const handle = await imagesDirHandle.getFileHandle(name);
      const file = await handle.getFile();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [width, height, img] = await loadImage(file)
      const image = await fileToImage(file);
      const perceptualHash = await computeAverageHash(image)
      images.push([name, width, height, perceptualHash]);

    }
  }

  // Insert each image one by one, keeping each operation in its own transaction
  for (const [name, width, height, perceptualHash] of images) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");

      const getRequest = store.get(name);

      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          const format = name.split('.').pop()?.toLowerCase() || 'unknown';
          const addRequest = store.add({
            name: name,
            format: format,
            width: width,
            height: height,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            perceptualHash: perceptualHash,
          });

          addRequest.onsuccess = () => {
            console.log("Added:", name);
            resolve();
          };

          addRequest.onerror = (event) => {
            console.error("Add error for", name, event);
            reject(addRequest.error);
          };
        } else {
          console.log("Already exists:", name);
          resolve();
        }
      };

      getRequest.onerror = (event) => {
        console.error("Get error for", name, event);
        reject(getRequest.error);
      };
    });
  }

  console.log("All new images processed.");

  await computeOrder(db)
  console.log("order computed")
}
function hammingDistance(a: string, b: string) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

function sortBySimilarity(imagesWithHash: ImageRecord[]) {
  if (imagesWithHash.length === 0) return [];

  const visited = new Set();
  const result = [];

  // Start with first image
  let current = imagesWithHash[0];
  visited.add(current.name);
  result.push(current);

  while (result.length < imagesWithHash.length) {
    let closest = null;
    let minDist = Infinity;

    for (const candidate of imagesWithHash) {
      if (visited.has(candidate.name)) continue;
      const dist = hammingDistance(current.perceptualHash, candidate.perceptualHash);
      if (dist < minDist) {
        minDist = dist;
        closest = candidate;
      }
    }

    if (closest) {
      visited.add(closest.name);
      result.push(closest);
      current = closest;
    } else {
      break; // no more reachable
    }
  }

  return result;
}


async function computeOrder(db: IDBDatabase) {
  // 1. Load all image hashes
  const tx = db.transaction("images", "readonly");
  const store = tx.objectStore("images");
  const allImages: ImageRecord[] = await new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // 2. Sort them by similarity (greedy)
  const sorted = sortBySimilarity(allImages);  // using your existing or previous function

  // 3. Store back similarityOrder
  for (let i = 0; i < sorted.length; i++) {
    const image = sorted[i];
    image.similarityOrder = i;

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("images", "readwrite");
      const store = tx.objectStore("images");
      const req = store.put(image);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

}

export async function saveIndexedDBToFile(db: IDBDatabase, rootDirHandle: FileSystemDirectoryHandle): Promise<void> {
  const STORE_NAME = 'images';
  const BACKUP_FILE_NAME = 'images-indexeddb-backup.json';

  // Read all data from the object store
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const getAllRequest = store.getAll();

  const records = await new Promise<unknown[]>((resolve, reject) => {
    getAllRequest.onsuccess = () => resolve(getAllRequest.result);
    getAllRequest.onerror = () => reject(getAllRequest.error);
  });

  // Save the data to the backup file
  const backupFileHandle = await rootDirHandle.getFileHandle(BACKUP_FILE_NAME, { create: true });
  const writable = await backupFileHandle.createWritable();
  await writable.write(JSON.stringify(records, null, 2));
  await writable.close();

  console.log(`Saved ${records.length} records from IndexedDB to backup file.`);
}

export async function getAllRecords<T = unknown>(db: IDBDatabase, storeName = 'images'): Promise<T[]> {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);

  return new Promise<T[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeRecords(db: IDBDatabase, records: { name: string }[]) {
  const STORE_NAME = 'images';
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const record of records) {
    const name = record.name;
    const request = store.delete(name);  // ✅ delete, not deleteIndex

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export async function syncDatabaseWithImageFolder(
  imagesDirHandle: FileSystemDirectoryHandle,
  db: IDBDatabase
): Promise<void> {
  const storeName = 'images';
  const filesOnDisk = new Set<string>();

  for await (const [name, handle] of imagesDirHandle.entries()) {
    if (handle.kind !== 'file') continue;
    filesOnDisk.add(name);

    const exists = await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const getRequest = store.get(name);

      getRequest.onsuccess = () => resolve(!!getRequest.result)
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (exists) {
      continue;
    }

    try {
      // Read file and extract metadata
      const fileHandle = await imagesDirHandle.getFileHandle(name);
      const file = await fileHandle.getFile();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [width, height, img] = await loadImage(file);
      const image = await fileToImage(file);
      const perceptualHash = await computeAverageHash(image)

      const extension = name.split('.').pop()?.toLowerCase() || 'unknown';

      const record = {
        name: name,
        format: extension,
        width: width,
        height: height,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        perceptualHash: perceptualHash,
      };
      console.log(record)

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const addRequest = store.add(record);
        addRequest.onsuccess = () => {
          console.log("Added:", name);
          resolve();
        };
        addRequest.onerror = () => reject(addRequest.error);
      });
    } catch (err) {
      console.error("Error processing image:", name, err);
    }
  }

  // Remove records from DB that are no longer in the folder
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (!cursor) return resolve();

      const record = cursor.value;
      if (!filesOnDisk.has(record.name)) {
        cursor.delete();
      }

      cursor.continue();
    };

    cursorRequest.onerror = () => reject(cursorRequest.error);
  });

  await computeOrder(db)
  console.log("order computed")
  console.log("Database sync complete.");
}

export async function getImagesUsingDatabase(
  imagesDirHandle: FileSystemDirectoryHandle | null,
  db: IDBDatabase | null,
  offset = 0,
  limit = 10,
): Promise<indexedImage[]> {
  if (!imagesDirHandle || !db) return [];

  const tx = db.transaction(IMAGE_STORE, 'readonly');
  const store = tx.objectStore(IMAGE_STORE);

  const records: [number, string, ImageRecord][] = [];
  let skipped = 0;
  let index = offset;

  await new Promise<void>((resolve, reject) => {
    const hashindex = store.index('similarityOrder');
    const request = hashindex.openCursor();

    request.onerror = () => {
      console.error('Error reading images:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor || records.length >= limit) {
        resolve(); // Will process file handles after this
        return;
      }

      if (skipped < offset) {
        skipped++;
        cursor.continue();
        return;
      }

      const record: ImageRecord = cursor.value;
      records.push([index++, record.name, record]);
      cursor.continue();
    };
  });

  const indexedImages: indexedImage[] = [];


  for (const [index, name, imageRecord] of records) {
    try {
      const handle = await imagesDirHandle.getFileHandle(name);
      const file = await handle.getFile();
      const url = URL.createObjectURL(file);
      indexedImages.push([index, url, imageRecord]);
    } catch {
      console.warn(`Could not load file for image: ${name}`);
    }
  }

  return indexedImages;
}

export async function fetchRecordsFromDatabase(
  db: IDBDatabase | null,
  offset = 0,
  limit = 10,
): Promise<ImageRecord[] | undefined> {
  if (!db) return;

  const tx = db.transaction(IMAGE_STORE, 'readonly');
  const store = tx.objectStore(IMAGE_STORE);

  const records: ImageRecord[] = [];
  let skipped = 0;

  await new Promise<void>((resolve, reject) => {
    const index = store.index('similarityOrder');
    const request = index.openCursor();

    request.onerror = () => {
      console.error('Error reading images:', request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor || records.length >= limit) {
        resolve();
        return;
      }

      if (skipped < offset) {
        skipped++;
        cursor.continue();
        return;
      }

      records.push(cursor.value as ImageRecord);
      cursor.continue();
    };
  });

  return records;
}


export async function countImages(db: IDBDatabase) {
  const tx = db.transaction(IMAGE_STORE, 'readonly');
  const store = tx.objectStore(IMAGE_STORE);

  return new Promise<number>((resolve, reject) => {
    const request = store.count()

    request.onerror = () => {
      console.log('Error in counting images', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result);
    }
  })
}

