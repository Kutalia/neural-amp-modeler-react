import Pitchfinder from 'pitchfinder';

const A = 440;
const SEMITONE = 69;
const noteStrings = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B'
];

const getNote = freq => {
  const note = 12 * (Math.log(freq / A) / Math.log(2));
  return Math.round(note) + SEMITONE;
};

const getStandardFrequency = note => {
  return A * Math.pow(2, (note - SEMITONE) / 12);
};

const getCents = (frequency, note) => {
  return Math.floor(
    (1200 * Math.log(frequency / getStandardFrequency(note))) / Math.log(2)
  );
};

export const analyzeNote = (buf) => {
  const detectPitch = new Pitchfinder.AMDF({
    maxFrequency: 800,
    minFrequency: 50
  });
  const pitch = detectPitch(buf);
  if (pitch) {
    const freq = pitch * 1.09;
    const note = getNote(freq);
    const cents = getCents(freq, note);
    const noteName = noteStrings[note % 12];
    const octave = parseInt(note / 12) - 1;

    return { freq, note, cents, noteName, octave };
  }
};
