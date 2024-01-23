import JSZip from 'jszip';

const zip = new JSZip();

const downloadBlob = (url) =>
  window.fetch(url)
    .then(res => res.blob());

// for compatibility with directory select inputs
const getFilesFromZip = (archive, filterByExt = '') => {
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

  return Promise.all(promises).then(() => files);
};

export const getFilesFromZipUrl = async (url, filterByExts = null) => {
  const blob = await downloadBlob(url);
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
