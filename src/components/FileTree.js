import { useEffect, useState, useMemo } from 'react';
import {
  createFileTree,
  ToggleFileTree,
} from 'react-toggle-file-tree';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

import { getAllSavedBlobs } from '../helpers/cache';
import { getFilesFromZipBlob } from '../helpers/unzipProfiles';

const getFileExt = (file) => file.name.slice(file.name.lastIndexOf('.'));
const getRawFiles = (fileList, localPath, ext) => fileList.filter((f) => localPath === f.localPath && getFileExt(f.file) === ext).map(f => f.file)

export const FileTree = ({ loadProfiles, loadIrs, loading, refetch }) => {
  const [fileList, setFileList] = useState([]);

  const handleFileClick = (e) => {
    if (loading) {
      return;
    }

    const { file, localPath } = e;
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
  const handleDirectoryClick = () => { };

  useEffect(() => {
    const func = async () => {
      if (!refetch) {
        return;
      }

      const cachedBlobs = await getAllSavedBlobs();
      const newList = [];

      if (!cachedBlobs) {
        return;
      }

      const promises = cachedBlobs.map(({ profilesUrl, profilesBlob }) =>
        getFilesFromZipBlob(profilesBlob).then(files => {
          if (files.length) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              newList.push({
                file,
                fileName: file.name,
                localPath: `${profilesUrl.slice(profilesUrl.lastIndexOf('/'))}`,
              });
            }
          }
        })
      );

      await Promise.all(promises);

      setFileList(newList);
    }

    func();
  }, [refetch]);

  const fileTree = useMemo(() => createFileTree(fileList), [fileList]);

  if (!fileList.length) {
    return null;
  }

  return (
    <div>
      <p>Downloaded profiles{loading && <span>&nbsp;(loading...)</span>}</p>
      <div {...stylex.props(styles.fileTree, loading && styles.fileTreeLoading)}>
        <ToggleFileTree
          list={fileTree}
          handleFileClick={handleFileClick}
          handleDirectoryClick={handleDirectoryClick}
        />
      </div>
    </div>
  );
};
