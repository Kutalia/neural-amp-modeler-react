import { useEffect, useState, useMemo } from 'react';
import * as stylex from '@stylexjs/stylex';
import * as Tone from 'tone';

import { styles } from '../styles';
import { KnobPercentage } from './knob/KnobPercentage';
import { KnobFrequency } from './knob/KnobFrequency';
import { camelToStartCase } from '../helpers/camelToStartCase';

const knobParams = {
  delayTime: {
    label: 'time',
    default: Tone.FeedbackDelay.getDefaults().delayTime,
    min: 0.1,
    max: 2,
    getOnChange: (delayNodes) => (value) => {
      delayNodes.feedbackDelay.delayTime.value = value;
      delayNodes.pingPongDelay.delayTime.value = value;
    },
    KnobComp: KnobPercentage,
  },
  feedback: {
    label: 'feedback',
    default: Tone.FeedbackDelay.getDefaults().feedback,
    min: 0,
    max: 1,
    getOnChange: (delayNodes) => (value) => {
      delayNodes.feedbackDelay.feedback.value = value;
      delayNodes.pingPongDelay.feedback.value = value;
    },
    KnobComp: KnobPercentage,
  },
  highPassCutoff: {
    label: 'low cut',
    default: 60,
    min: 50,
    max: 700,
    getOnChange: (delayNodes) => (value) => { delayNodes.highPass.frequency.value = value; },
    KnobComp: KnobFrequency,
  },
  lowPassCutoff: {
    label: 'high cut',
    default: 10000,
    min: 1000,
    max: 12000,
    getOnChange: (delayNodes) => (value) => { delayNodes.lowPass.frequency.value = value; },
    KnobComp: KnobFrequency,
  },
  wet: {
    label: 'wet',
    default: 0.5,
    min: 0,
    max: 1,
    getOnChange: (delayNodes) => (value) => {
      delayNodes.dryNode.gain.value = 1 - value;
      delayNodes.wetNode.gain.value = value;
    },
    KnobComp: KnobPercentage,
  }
};

export const Delay = ({ audioContext, sourceNode, destinationNode, onNodeChange, postFxIndex }) => {
  const [delayNodes, setDelayNodes] = useState();
  const [active, setActive] = useState(false);
  const [pingPong, setPingPong] = useState(false);

  // audio nodes initialization
  useEffect(() => {
    if (audioContext && sourceNode && destinationNode && !delayNodes) {
      Tone.setContext(audioContext);
      const delayParams = { delayTime: knobParams.delayTime.default, maxDelay: knobParams.delayTime.max };
      const feedbackDelay = new Tone.FeedbackDelay(delayParams);
      const pingPongDelay = new Tone.PingPongDelay(delayParams);
      feedbackDelay.wet.set(1);
      pingPongDelay.wet.set(1);
      const lowPass = new Tone.BiquadFilter(knobParams.lowPassCutoff.default, 'lowpass');
      const highPass = new Tone.BiquadFilter(knobParams.highPassCutoff.default, 'highpass');
      const dryNode = new GainNode(audioContext, { gain: 1 - knobParams.wet.default });
      const wetNode = new GainNode(audioContext, { gain: knobParams.wet.default });
      // for merging dry and wet signals
      const finalNode = new GainNode(audioContext);

      setDelayNodes({ feedbackDelay, pingPongDelay, lowPass, highPass, dryNode, wetNode, finalNode });
    }
  }, [audioContext, destinationNode, sourceNode, delayNodes, onNodeChange]);

  // cleanup and audio nodes hooking
  useEffect(() => {
    const delayKey = pingPong ? 'pingPongDelay' : 'feedbackDelay';

    const cleanup = () => {
      try {
        sourceNode.disconnect(delayNodes.dryNode);
        Tone.disconnect(sourceNode, delayNodes[delayKey]);
        Tone.disconnect(delayNodes[delayKey], delayNodes.lowPass);
        Tone.disconnect(delayNodes.lowPass, delayNodes.highPass);
        Tone.disconnect(delayNodes.highPass, delayNodes.wetNode);
        Tone.disconnect(delayNodes.wetNode, delayNodes.finalNode);
        delayNodes.dryNode.disconnect(delayNodes.finalNode);
        delayNodes.finalNode.disconnect(destinationNode);
        sourceNode.connect(destinationNode);
        onNodeChange((nodes) => {
          const newNodes = [...nodes];
          newNodes[postFxIndex] = null;
          return newNodes;
        });
      } catch (err) { }
    };

    if (audioContext && sourceNode && destinationNode && active && delayNodes) {
      try {
        sourceNode.disconnect(destinationNode);
      } catch (err) { }
      sourceNode.connect(delayNodes.dryNode);
      Tone.connect(sourceNode, delayNodes[delayKey]);
      Tone.connect(delayNodes[delayKey], delayNodes.lowPass);
      Tone.connect(delayNodes.lowPass, delayNodes.highPass);
      Tone.connect(delayNodes.highPass, delayNodes.wetNode);
      Tone.connect(delayNodes.wetNode, delayNodes.finalNode);
      delayNodes.dryNode.connect(delayNodes.finalNode);
      delayNodes.finalNode.connect(destinationNode);
      onNodeChange((nodes) => {
        const newNodes = [...nodes];
        newNodes[postFxIndex] = delayNodes.finalNode;
        return newNodes;
      });

      return cleanup;
    }
  }, [active, audioContext, destinationNode, sourceNode, delayNodes, onNodeChange, postFxIndex, pingPong]);

  const knobs = useMemo(() => {
    if (!delayNodes) {
      return null;
    }

    let knobs = [];

    for (const nodeKey in knobParams) {
      const knob = knobParams[nodeKey];
      const { KnobComp } = knob;

      knobs.push(<KnobComp
        key={knob.label}
        label={camelToStartCase(knob.label)}
        valueMin={knob.min}
        valueMax={knob.max}
        valueDefault={knob.default}
        onChange={knob.getOnChange(delayNodes)}
      />);
    }

    return knobs;
  }, [delayNodes]);

  if (!delayNodes) {
    return <p>Please select profile first</p>;
  }

  return (
    <div>
      <h4>
        <span>
          <label htmlFor="delay">Delay</label>&nbsp;
          <input type="checkbox" id="delay" onClick={() => setActive((active) => !active)} />
        </span>
        &nbsp;
        <span>
          <label htmlFor="ping-pong">Ping Pong</label>&nbsp;
          <input type="checkbox" id="ping-pong" onClick={() => setPingPong((pingPong) => !pingPong)} />
        </span>
      </h4>
      <div {...stylex.props(styles.postFxControls)}>
        {knobs}
      </div>
    </div>
  );
};
