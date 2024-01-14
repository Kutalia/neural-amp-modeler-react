export const readProfile = (event) => {
  return new Promise((resolve, reject) => {
    if (!event.target.files?.length) {
      reject('NAM profile selection canceled');
    }

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;
      resolve(content);
    }

    reader.readAsText(file);
  });
};
