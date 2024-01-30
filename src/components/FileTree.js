import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  createFileTree,
  ToggleFileTree,
} from 'react-toggle-file-tree';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

import { deleteBlobByKey, getAllSavedBlobs } from '../helpers/cache';
import { getFilesFromZipBlob } from '../helpers/unzipProfiles';

const getFileExt = (file) => file.name.slice(file.name.lastIndexOf('.'));
const getRawFiles = (fileList, localPath, ext) => fileList.filter((f) => localPath === f.localPath && getFileExt(f.file) === ext).map(f => f.file)

export const FileTree = ({ loadProfiles, loadIrs, loading, refetch }) => {
  const [fileList, setFileList] = useState([]);
  const [selectedDirectory, setSelectedDirectory] = useState();

  const handleFileClick = (e) => {
    if (loading) {
      return;
    }

    const { file, localPath, blobKey, title } = e;

    setSelectedDirectory({
      key: blobKey,
      title: title || localPath.slice(1),
    })

    const ext = getFileExt(file);

    // load all files of that type, just like in NAM plugin
    const files = getRawFiles(fileList, localPath, ext);
    const index = files.findIndex(({ name }) => name === file.name);

    if (ext === '.nam') {
      loadProfiles(files, index);
    } else if (ext === '.wav') {
      loadIrs(files, index);
    }
  };
  const handleDirectoryClick = (e) => {
    setSelectedDirectory({
      key: e.value.files[0].blobKey,
      title: e.title || e.key,
    });
  };

  const readCacheToList = useCallback(async () => {
    const cachedBlobs = await getAllSavedBlobs();
    const newList = [];

    if (!cachedBlobs) {
      return;
    }

    const promises = cachedBlobs.map(({ profilesUrl, profilesBlob, title }) =>
      getFilesFromZipBlob(profilesBlob).then(files => {
        if (files.length) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            newList.push({
              file,
              fileName: file.name,
              localPath: title ? `/${title}` : `${profilesUrl.slice(profilesUrl.lastIndexOf('/'))}`,
              blobKey: profilesUrl,
              title,
            });
          }
        }
      })
    );

    await Promise.all(promises);

    setFileList(newList);
  }, [])

  useEffect(() => {
    if (!refetch) {
      return;
    }
    
    readCacheToList();
  }, [readCacheToList, refetch]);

  const fileTree = useMemo(() => createFileTree(fileList), [fileList]);

  const deleteCachedBlob = () => {
    if (window.confirm(`Are you sure? This will remove the entire selected directory (${selectedDirectory.title}) from the cache`)) {
      deleteBlobByKey(selectedDirectory.key).then(readCacheToList);
    }
  };

  if (!fileList.length) {
    return null;
  }

  return (
    <div {...stylex.props(styles.fileTreeWrapper)}>
      <p>Downloaded profiles {loading && <span>(loading...)</span>}</p>
      <p>Selected directory: {selectedDirectory
        && <>
          <span {...stylex.props(styles.selectedDirectory)}>
            {selectedDirectory.title}
          </span>
          &nbsp;
          <button onClick={deleteCachedBlob}>Delete</button>
        </>
      }</p>
      <div {...stylex.props(styles.fileTree)}>
        <div {...stylex.props(styles.fileTreeContent, loading && styles.fileTreeLoading)}>
          <ToggleFileTree
            list={fileTree}
            handleFileClick={handleFileClick}
            handleDirectoryClick={handleDirectoryClick}
          />
        </div>
      </div>
    </div>
  );
};
