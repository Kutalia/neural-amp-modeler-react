
export const camelToStartCase = (camel) => {
  const camelCase = camel.replace(/([a-z])([A-Z])/g, '$1 $2').split(" ");

  let flat = "";

  camelCase.forEach(word => {
    flat = flat + word.charAt(0).toUpperCase() + word.slice(1) + " "
  });
  return flat;
};
