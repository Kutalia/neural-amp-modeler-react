import { useState } from 'react';

export const useModule = () => {
  const [modulePromise] = useState(() =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        const { Module } = window;

        // a dirty trick since we are not using modularized wasm
        // currently full functionality loading (which includes malloc) relies on asm
        if (Module && Module["asm"]) {
          resolve(Module);
          clearInterval(interval);
        }
      }, 100);
    })
  );

  return modulePromise;
};
