export const calcDbToLinear = (dB) => {
  if (!dB) {
    return 1;
  }

  return Math.pow(10, dB / 10);
}
