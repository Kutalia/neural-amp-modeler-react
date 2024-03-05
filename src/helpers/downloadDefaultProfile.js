const DEFAULT_PROFILE_PATH = `${process.env.PUBLIC_URL}/Mesa Mk3 HiGain.nam`;
const DEFAULT_PROFILE_NAME = 'Crab Amps Mark III';

export const downloadDefaultProfile = async () =>
  await fetch(DEFAULT_PROFILE_PATH)
    .then(res => res.blob())
    .then((blob) =>
      new File([blob], DEFAULT_PROFILE_NAME, {
        type: '.nam',
      })
    );
