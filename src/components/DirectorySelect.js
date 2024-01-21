import { useState } from 'react';

const webkitdirectorySupported = 'webkitdirectory' in document.createElement('input');
const EmptyComp = () => null;

export const Comp = ({ label, fileExt, onFileSelect, disabled }) => {
  const [files, setFiles] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);

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

    onFileSelect(filteredFiles[0]);
  };

  const renderOptions = () => {
    return [...files].map((file, index) => (
      <option onClick={() => onFileSelect(file)} key={Math.random()} value={index}>
        {file.name}
      </option>
    ));
  };

  const handleFileSelect = (e) => {
    const index = e.target.value;

    onFileSelect(files[index]);
    setSelectedIndex(index);
  };

  return (
    <div>
      <p>{label}</p>
      <input type="file" webkitdirectory="true" onChange={handleDirectoryChange} disabled={disabled} />
      <div>
        {
          files &&
          <select value={selectedIndex} onChange={handleFileSelect} disabled={disabled}>
            {
              renderOptions()
            }
          </select>
        }
      </div>
    </div>
  );
};

export const DirectorySelect = webkitdirectorySupported ? Comp : EmptyComp;
