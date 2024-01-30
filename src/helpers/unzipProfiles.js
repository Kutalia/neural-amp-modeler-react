import JSZip from 'jszip';

// for compatibility with directory select inputs
const getFilesFromZip = async (archive, filterByExt = '') => {
  const filteredZipObjs = archive.filter((_, file) => !filterByExt || file.name.slice(-(filterByExt.length)) === filterByExt);

  const files = Array(filteredZipObjs.length), promises = [];

  for (let i = 0; i < filteredZipObjs.length; i++) {
    const zipObj = filteredZipObjs[i];
    const index = i;

    promises.push(zipObj.async('blob')
      .then(blob => {
        files[index] = new File([blob], zipObj.name, {
          type: filterByExt,
          date: zipObj.date.getTime(),
        });
      }));
  }

  await Promise.all(promises);
  return files;
};

export const getFilesFromZipBlob = async (blob, filterByExts = null) => {
  const zip = new JSZip();
  const archive = await zip.loadAsync(blob);
  let files = {};

  // flat array if all files are requested
  if (!filterByExts) {
    files = await getFilesFromZip(archive);
  } else {
    for (const ext of filterByExts) {
      files[ext] = await getFilesFromZip(archive, ext);
    }
  }

  return files;
};
