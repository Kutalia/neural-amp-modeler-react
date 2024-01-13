export const getCabConvolver = (audioContext, buffer, cb) => {
  const cabConvolver = new ConvolverNode(audioContext);
  audioContext?.decodeAudioData(buffer, decoded => {
    cabConvolver.buffer = decoded;
    cb && cb(cabConvolver);
  });
};
