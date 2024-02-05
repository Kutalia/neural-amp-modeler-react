import { useEffect, useState, useMemo, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';
import { KnobPercentage } from './knob/KnobPercentage';
import { camelToStartCase } from '../helpers/camelToStartCase';

export const Reverb = ({ audioContext, sourceNode, destinationNode, onNodeChange }) => {
  const [reverb, setReverb] = useState();
  const [active, setActive] = useState(false);
  const reverbDestroyParamRef = useRef();

  useEffect(() => {
    const createReverb = async () => {
      if (audioContext && sourceNode && destinationNode && !reverb) {
        await audioContext.audioWorklet.addModule('dattorroReverb.js');
        const reverb = new AudioWorkletNode(audioContext, 'DattorroReverb', { outputChannelCount: [2] });

        reverbDestroyParamRef.current = reverb.parameters.get('destroy');
        setReverb(reverb);
      }
    }

    createReverb();
  }, [audioContext, destinationNode, sourceNode, reverb, onNodeChange]);

  useEffect(() => {
    const cleanup = () => {
      try {
        sourceNode.disconnect(reverb);
        reverb.disconnect(destinationNode);
        sourceNode.connect(destinationNode);
        // the reverb components internally stores audio node but tells the parent component if it's used or not
        onNodeChange(null);
      } catch (err) { }
    };

    if (audioContext && sourceNode && destinationNode && active && reverb) {
      try {
        sourceNode.disconnect(destinationNode);
      } catch (err) { }
      sourceNode.connect(reverb);
      reverb.connect(destinationNode);
      onNodeChange(reverb);

      return cleanup;
    }
  }, [audioContext, destinationNode, sourceNode, reverb, active, onNodeChange]);

  useEffect(() => {
    return () => {
      if (reverbDestroyParamRef.current) {
        reverbDestroyParamRef.current.value = 1;
        onNodeChange(null);
      }
    }
  }, [onNodeChange]);

  const knobs = useMemo(() => {
    if (!reverb) {
      return null;
    }

    const paramsArr = Array.from(reverb.parameters.entries())
      .filter(([title]) => title !== 'destroy')
      .sort(([title1], [title2]) => title1 === title2 ? 0 : title1 > title2 ? 1 : -1);

    return paramsArr.map(([title, { minValue, maxValue, defaultValue }]) => (
      <KnobPercentage
        key={title}
        label={camelToStartCase(title)}
        valueMin={minValue}
        valueMax={maxValue}
        valueDefault={defaultValue}
        onChange={(val) => { paramsArr.find(([t]) => t === title)[1].value = val; }}
      />
    ));
  }, [reverb]);

  if (!reverb) {
    return <p>Please select profile first</p>;
  }

  return (
    <div>
      <h4>
        <label htmlFor="reverb">Dattorro Reverb</label>&nbsp;
        <input type="checkbox" id="reverb" onClick={() => setActive((active) => !active)} />
      </h4>
      <div {...stylex.props(styles.reverbControls)}>
        {knobs}
      </div>
    </div>
  );
};
