import { useState, useEffect } from 'react';

import { getFilesFromZipUrl } from '../helpers/downloadProfiles';

export const useDownloadProfiles = () => {
  const [profiles, setProfiles] = useState();
  const [irs, setIrs] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let url = '';

    try {
      url = window.location.search.split('profileUrl=')[1];
    } catch (err) {
      console.log('No preloaded profiles url or an invalid one');
    }

    if (url) {
      setLoading(true);
      getFilesFromZipUrl(url, ['.nam', '.wav']).then((files) => {
        setProfiles(files['.nam']);
        setIrs(files['.wav']);
        setLoading(false);
      });
    }
  }, []);

  return {
    profiles: profiles?.length ? profiles : null,
    irs: irs?.length ? irs: null,
    loading
  };
};
