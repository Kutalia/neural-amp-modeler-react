import { useState, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

const webkitdirectorySupported = 'webkitdirectory' in document.createElement('input');
const EmptyComp = () => null;

export const Comp = ({ label, fileExt, onFileSelect, disabled }) => {
  const [files, setFiles] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  // file name of an individual upload if it's not a directory mode
  const [fileUploadName, setFileUploadName] = useState();

  const fileInputRef = useRef();
  const directoryInputRef = useRef();

  const handleDirectoryChange = (e) => {
    if (!e.target.files?.length) {
      return;
    }

    const filesArray = [...e.target.files];
    const fileExtRegex = new RegExp(`.*(${fileExt})$`);
    const filteredFiles = (filesArray.filter(
      ({ name }) => fileExtRegex.test(name))
    );

    setFiles(filteredFiles);
    setSelectedIndex(0);
    // clear hidden file input so the user can select the same file again
    fileInputRef.current.value = null;
    // it's either directory or a file mode
    setFileUploadName(null);

    onFileSelect(filteredFiles[0]);
  };

  const renderOptions = () => {
    return [...files].map((file, index) => (
      <option onClick={() => onFileSelect(file)} key={Math.random()} value={index}>
        {file.name}
      </option>
    ));
  };

  const handleSelectChange = (e) => {
    const index = e.target.value;

    if (index === "-1") {
      fileInputRef.current.click();
      e.preventDefault();
      return;
    }

    const file = files[index];

    onFileSelect(file);
    setSelectedIndex(index);
  };

  const handleSelectClick = (e) => {
    if (fileUploadName || !files) {
      fileInputRef.current.click();
      e.preventDefault();
    }
  }

  const handleFileInput = (e) => {
    if (!e.target.files?.length) {
      return;
    }

    const file = e.target.files[0];

    onFileSelect(file);
    setFileUploadName(file.name);
    setFiles(null);
    directoryInputRef.current.value = null;
  };

  const handleOpenDirectory = () => {
    directoryInputRef.current.click();
  };

  return (
    <div>
      <p>{label}</p>
      <div {...stylex.props(styles.directoryInputWrapper)}>
        <img
          src="folder.svg"
          alt="Folder"
          onClick={handleOpenDirectory}
          {...stylex.props(styles.directoryButton)}
        />
        <select
          value={selectedIndex}
          onChange={handleSelectChange}
          onClick={handleSelectClick}
          disabled={disabled}
          {...stylex.props(styles.directoryFileSelect)}
        >
          <option value="-1">{fileUploadName || 'Choose file'}</option>
          {
            files && renderOptions()
          }
        </select>

        <input
          type="file"
          webkitdirectory="true"
          onChange={handleDirectoryChange}
          disabled={disabled}
          ref={directoryInputRef}
          {...stylex.props(styles.directoryHiddenInput)}
        />
        <input
          type="file"
          accept={fileExt}
          onChange={handleFileInput}
          ref={fileInputRef}
          {...stylex.props(styles.directoryHiddenInput)}
        />
      </div>
    </div>
  );
};

export const DirectorySelect = webkitdirectorySupported ? Comp : EmptyComp;
