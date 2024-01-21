export const readProfile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;
      resolve(content);
    }

    reader.readAsText(file);
  });
};
