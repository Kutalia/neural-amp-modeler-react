import { useState, useEffect, useCallback } from 'react';

import { getFilesFromZipBlob } from '../helpers/unzipProfiles';
import { saveProfilesBlob, getProfilesByKey } from '../helpers/cache';

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
      getProfilesByKey(url).then((cachedBlob) => {
        if (cachedBlob) {
          updateProfilesFromBlob(cachedBlob);
        } else {
          setLoading(true);
          window.fetch(url)
            .then(res => res.blob()).then(blob => {
              updateProfilesFromBlob(blob);
              saveProfilesBlob(url, blob);
            });
        }
      });
    }
  }, [updateProfilesFromBlob]);

  return {
    profiles: profiles?.length ? profiles : null,
    irs: irs?.length ? irs : null,
    loading
  };
};
