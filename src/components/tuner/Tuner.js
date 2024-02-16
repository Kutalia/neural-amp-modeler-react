import { useState, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../../styles';
import { analyzeNote } from '../../helpers/noteAnalyzer';

import { RangeBar } from './RangeBar';

const fftSize = 1024 * 8;
const defaultNode = {
  noteName: '--',
  octave: '--',
  cents: 0,
  freq: NaN,
};

export const Tuner = ({ audioStream, useRightChannel }) => {
  const [note, setNote] = useState(defaultNode);
  const [mute, setMute] = useState(true);

  useEffect(() => {
    if (!audioStream) {
      return;
    }

    let idObj = { id: null };

    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(audioStream);

    const channelMerger = audioContext.createChannelMerger(2);
    const channelSplitter = audioContext.createChannelSplitter(2);

    audioSource.connect(channelSplitter);

    channelSplitter.connect(channelMerger, useRightChannel ? 1 : 0, 0);
    // duplication the connection on the second audio merger channel as well to retain original audio level instead of cutting in half
    channelSplitter.connect(channelMerger, useRightChannel ? 1 : 0, 1);

    const audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.fftSize = fftSize;

    const process = function () {
      idObj.id = requestAnimationFrame(process);

      const buf = new Float32Array(fftSize);
      audioAnalyser.getFloatTimeDomainData(buf);

      const resultNote = analyzeNote(buf);

      setNote(resultNote || defaultNode);
    };

    channelMerger.connect(audioAnalyser);
    if (!mute) {
      channelMerger.connect(audioContext.destination);
    }
    process();

    return (() => {
      idObj.id && cancelAnimationFrame(idObj.id);
      audioContext.close();
    });
  }, [audioStream, useRightChannel, mute]);

  const tuned = -5 <= note.cents && note.cents <= 5;

  const handleMuteChange = (e) => {
    const shouldMute = !!e.target.checked;;

    setMute(shouldMute);
  }

  return (
    <div>
      <div>
        <label htmlFor="mute">Mute Clean Input&nbsp;</label>
        <input id="mute" type="checkbox" onClick={handleMuteChange} defaultChecked />
      </div>
      <br />
      <div {...stylex.props(styles.tuner)}>
        <div {...stylex.props(styles.tunerResult, tuned && styles.tuned)}>
          <span {...stylex.props(styles.noteName)}>
            {note.noteName}
            <span {...stylex.props(styles.octave)}>
              {note.octave}
            </span>
          </span>
          <span {...stylex.props(styles.cents)}>
            {note.cents}
          </span>
          <span {...stylex.props(styles.frequency)}>
            {Math.round(note.freq)}&nbsp;Hz
          </span>
        </div>

        <RangeBar value={note.cents}></RangeBar>
      </div>
    </div>
  );
};

