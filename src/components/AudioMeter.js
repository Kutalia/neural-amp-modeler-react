import { useEffect, useState, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';
import { calcLinearToDb } from '../helpers/scaleDb';

const fftSize = 1024 * 4;
const minDb = 40;
const canvasHeight = 100;

export const AudioMeter = ({ audioSource }) => {
  const volumeRef = useRef(0);
  const [canvas, setCanvas] = useState();
  const canvasCtxRef = useRef();

  useEffect(() => {
    if (!canvas || !audioSource) {
      return;
    }

    let idObj = { id: null };

    const audioCtx = audioSource.context;

    const audioAnalyser = audioCtx.createAnalyser();
    audioAnalyser.fftSize = fftSize;
    audioAnalyser.minDecibels = -100;
    audioAnalyser.maxDecibels = 0;
    audioAnalyser.smoothingTimeConstant = 0.95;

    const process = function () {
      idObj.id = requestAnimationFrame(process);

      const buf = new Float32Array(fftSize);
      audioAnalyser.getFloatTimeDomainData(buf);
      let x;
      let peak = 0;

      for (let i = 0; i < buf.length; i++) {
        x = Math.abs(buf[i]);
        if (x > peak) {
          peak = x;
        }
      }

      volumeRef.current = calcLinearToDb(peak);

      canvasCtxRef.current.clearRect(0, 0, canvasCtxRef.current.canvas.width, canvasCtxRef.current.canvas.height);
      if (volumeRef.current > -3) {
        canvasCtxRef.current.fillStyle = 'red';
      } else {
        canvasCtxRef.current.fillStyle = '#00FF48';
      }
      canvasCtxRef.current.fillRect(0, canvasCtxRef.current.canvas.height * (-volumeRef.current / minDb), canvasCtxRef.current.canvas.width, canvasCtxRef.current.canvas.height + 100);
    };

    audioSource.connect(audioAnalyser);

    setTimeout(() => process());

    canvasCtxRef.current = canvas.getContext('2d');

    return (() => {
      idObj.id && cancelAnimationFrame(idObj.id);
      audioSource.disconnect(audioAnalyser);
    });
  }, [canvas, audioSource]);

  return (
    <div {...stylex.props(styles.audioMeter)}>
      <canvas ref={setCanvas} width="30" height={canvasHeight}></canvas>
    </div>
  );
};
