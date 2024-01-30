const PROFILES_DB_NAME = 'profiles';
const PROFILES_STORE_NAME = 'profiles';
const PROFILES_OBJ_KEY = 'profilesUrl';

const getDbOpenRequest = () => {
  const DBOpenRequest = window.indexedDB.open(PROFILES_DB_NAME);
  DBOpenRequest.onupgradeneeded = upgradeDb;
  return DBOpenRequest;
};

export const upgradeDb = (event) => {
  const db = event.target.result;

  // Create an objectStore for this database
  // currently using volatile profiles url as a key, better generate some unique id from api
  const objectStore = db.createObjectStore(PROFILES_STORE_NAME, { keyPath: 'profilesUrl' });

  objectStore.createIndex('profilesBlob', 'profilesBlob', { unique: true });

  console.log('Profile files object store created');
};

export const getProfilesByKey = (key) => new Promise((resolve, reject) => {
  const DBOpenRequest = getDbOpenRequest();

  DBOpenRequest.onsuccess = async () => {
    const db = DBOpenRequest.result;

    // check if already saved in database
    let objectStore = db.transaction(PROFILES_STORE_NAME).objectStore(PROFILES_STORE_NAME);
    const openCursorRequest = objectStore.openCursor();

    openCursorRequest.onsuccess = async (event) => {
      const cursor = event.target.result;

      if (!cursor) {
        db.close();
        console.log('Profiles blob couldnt be located in the cache');
        resolve(null);
        return;
      }

      if (cursor.key !== key) {
        cursor.continue();
        return;
      }

      const blob = cursor.value.profilesBlob;

      console.log('Profiles blob located in the cache, updating app state');

      db.close();
      resolve(blob);
    };

    openCursorRequest.onerror = () => {
      db.close();
      const reason = 'Couldnt open cache for searching saved profiles';
      console.error(reason)
      reject(reason);
    };
  };
});

export const saveProfilesBlob = (key, blob) => new Promise((resolve, reject) => {
  const DBOpenRequest = getDbOpenRequest();

  DBOpenRequest.onsuccess = async () => {
    const db = DBOpenRequest.result;

    // check if already saved in database
    let objectStore = db.transaction(PROFILES_STORE_NAME).objectStore(PROFILES_STORE_NAME);

    const newItem = { [PROFILES_OBJ_KEY]: key, profilesBlob: blob };

    const transaction = db.transaction([PROFILES_STORE_NAME], 'readwrite');

    transaction.oncomplete = () => {
      console.log('Downloaded profiles saving transaction completed');
    };
    transaction.onerror = () => {
      const reason = 'Error in downloaded profiles saving transaction';
      console.error(reason);
      db.close();
      reject(reason);
    };

    objectStore = transaction.objectStore(PROFILES_STORE_NAME);

    const objectStoreRequest = objectStore.add(newItem);

    objectStoreRequest.onsuccess = () => {
      console.log('Downloaded profile object storing success');
      db.close();
      resolve();
    };
    objectStoreRequest.onerror = () => {
      const reason = 'Downloaded profile object storing error';
      console.error(reason);
      db.close();
      reject(reason);
    };
  };
});

export const deleteBlobByKey = (key) => new Promise((resolve, reject) => {
  const DBOpenRequest = getDbOpenRequest();

  DBOpenRequest.onsuccess = () => {
    const db = DBOpenRequest.result;

    const transaction = db.transaction([PROFILES_STORE_NAME], 'readwrite');
    transaction.objectStore(PROFILES_STORE_NAME).delete(key);

    transaction.oncomplete = () => {
      console.log(`Profiles blob with key ${key} successfully deleted`);
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      const reason = `Couldnt delete profiles blob with key ${key}`;
      console.error(reason);
      db.close();
      reject(reason)
    }
  };
});

export const getAllSavedBlobs = () => new Promise((resolve, reject) => {
  const DBOpenRequest = getDbOpenRequest();

  DBOpenRequest.onsuccess = () => {
    const db = DBOpenRequest.result;

    // check if already saved in database
    let objectStore = db.transaction(PROFILES_STORE_NAME).objectStore(PROFILES_STORE_NAME);
    const openCursorRequest = objectStore.openCursor();

    const blobs = [];

    openCursorRequest.onsuccess = async (event) => {
      const cursor = event.target.result;

      if (cursor) {
        blobs.push(cursor.value);

        cursor.continue();
        return;
      }

      if (!blobs.length) {
        console.log('No profiles saved, the cache is empty');
        resolve();
      } else {
        console.log(`Found ${blobs.length} cached profile packs`);
        resolve(blobs);
      }

      db.close();
    };

    openCursorRequest.onerror = () => {
      db.close();
      const reason = 'Couldnt open cache for extracting all saved profiles';
      console.error(reason)
      reject(reason);
    };
  };
});
