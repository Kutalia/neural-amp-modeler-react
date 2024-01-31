export const calcDbToLinear = (dB) => {
  if (!dB) {
    return 1;
  }

  return Math.pow(10, dB / 10);
};

// dbFS - Decibels relative to full scale (0db)
// argument value is voltage
export const calcLinearToDb = (linear) => {
  if (!linear) {
    return Number.MIN_SAFE_INTEGER;
  }

  return 20 * Math.log10(linear);
};
