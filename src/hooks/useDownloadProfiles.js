import { useState, useEffect, useCallback } from 'react';

import { downloadBlob, getFilesFromZipBlob } from '../helpers/downloadProfiles';

export const useDownloadProfiles = () => {
  const [profiles, setProfiles] = useState();
  const [irs, setIrs] = useState();
  const [loading, setLoading] = useState(false);

  const updateProfilesFromBlob = useCallback(async (blob) => {
    const files = await getFilesFromZipBlob(blob, ['.nam', '.wav']);
    setProfiles(files['.nam']);
    setIrs(files['.wav']);
    setLoading(false);
  }, []);

  useEffect(() => {
    let url = '';

    try {
      const { searchParams } = new URL(window.location.href);
      url = searchParams.get('profileUrl');
    } catch (err) {
      console.log('No preloaded profiles url or an invalid one');
    }

    if (url) {
      const DBOpenRequest = window.indexedDB.open('profiles');
      let db;

      DBOpenRequest.onsuccess = async (event) => {
        db = DBOpenRequest.result;

        // check if already saved in database
        let objectStore = db.transaction('profiles').objectStore('profiles');
        objectStore.openCursor().onsuccess = async (event) => {
          const cursor = event.target.result;

          // download and save as it's not cached
          if (!cursor) {
            setLoading(true);

            const blob = await downloadBlob(url);
            updateProfilesFromBlob(blob);

            const newItem = { profilesUrl: url, profilesBlob: blob };

            const transaction = db.transaction(['profiles'], 'readwrite');

            transaction.oncomplete = () => {
              console.log('Downloaded profiles saving transaction completed');
            };
            transaction.onerror = () => {
              console.error('Error in downloaded profiles saving transaction');
            };

            objectStore = transaction.objectStore('profiles');

            const objectStoreRequest = objectStore.add(newItem);

            objectStoreRequest.onsuccess = (event) => {
              console.log('Downloaded profile object storing success');
            };
            objectStoreRequest.onerror = (event) => {
              console.error('Downloaded profile object storing error');
            };

            return;
          }

          if (cursor.key !== url) {
            cursor.continue();
            return;
          }

          const blob = cursor.value.profilesBlob;

          console.log('Profiles blob located in IndexedDB, updating app state');
          updateProfilesFromBlob(blob);
        }
      };

      DBOpenRequest.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create an objectStore for this database
        // currently using volatile profiles url as a key, better generate some unique id from api
        const objectStore = db.createObjectStore('profiles', { keyPath: 'profilesUrl' });

        objectStore.createIndex('profilesBlob', 'profilesBlob', { unique: true });

        console.log('Profile files object store created');
      };
    }
  }, [updateProfilesFromBlob]);

  return {
    profiles: profiles?.length ? profiles : null,
    irs: irs?.length ? irs : null,
    loading
  };
};
