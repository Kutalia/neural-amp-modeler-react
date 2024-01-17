export const getCabConvolver = (audioContext, buffer, cb, convolver) => {
  const cabConvolver = convolver || new ConvolverNode(audioContext);
  audioContext?.decodeAudioData(buffer, decoded => {
    cabConvolver.buffer = decoded;
    cb && cb(cabConvolver);
  });
};
