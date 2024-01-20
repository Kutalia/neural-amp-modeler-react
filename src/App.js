import { useRef, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as stylex from '@stylexjs/stylex';

import { getCabConvolver } from './helpers/getCabConvolver';
import { readProfile } from './helpers/readProfile';
import { styles } from './styles';
import { KnobPercentage } from './components/knob/KnobPercentage';
import { calcDbToLinear } from './helpers/scaleDb';
import { Announcement } from './components/Announcement';
import { Footer } from './components/Footer';

function App() {
  const diAudioRef = useRef();
  const [useDiTrack, setUseDiTrack] = useState(null);
  const [ir, setIr] = useState(false);
  const [audioContext, setAudioContext] = useState();
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamSourceRef = useRef();
  const inputGainNodeRef = useRef();
  const inputGainRef = useRef(1); // linear expression
  const outputGainNodeRef = useRef();
  const outputGainRef = useRef(1);

  const onCabChange = (cabConvolver) => {
    audioContext.resume();

    // disconnect old impulse response
    if (ir) {
      audioWorkletNode.disconnect(ir);
      ir.disconnect(outputGainNodeRef.current);
    }
    // disconnect full-rig nam to reconnect it to ir
    else {
      audioWorkletNode.disconnect(outputGainNodeRef.current);
    }

    audioWorkletNode.connect(cabConvolver);
    cabConvolver.connect(outputGainNodeRef.current);
    setIr(cabConvolver);
  };

  const onIRInput = (event) => {
    if (audioContext && event.target.files?.length) {
      event.target.files[0].arrayBuffer().then(buffer => getCabConvolver(audioContext, buffer, onCabChange, ir));
    }
  };

  const loadProfile = (jsonStr) => {
    const { Module } = window
    const ptr = Module._malloc(jsonStr.length + 1);
    Module.stringToUTF8(jsonStr, ptr, jsonStr.length + 1)

    if (audioContext) {
      audioContext.suspend();
    }

    Module.ccall(
      "setDsp",
      null,
      ["number"],
      [ptr],
      {
        async: true,
      }
    ).then(() => {
      Module._free(ptr);
      if (audioContext) {
        audioContext.resume();
      }
    });
  };

  useEffect(() => {
    window.wasmAudioWorkletCreated = (node1, node2) => {
      const audioWorkletNode = node1;
      const audioContext = node2;

      setAudioWorkletNode(audioWorkletNode);
      setAudioContext(audioContext);

      inputGainNodeRef.current = new GainNode(audioContext, { gain: inputGainRef.current });
      outputGainNodeRef.current = new GainNode(audioContext, { gain: outputGainRef.current });

      // initializing various web audio nodes when user is interacting for the first time
      if (!microphoneStreamNodeRef.current) {
        navigator.mediaDevices.getUserMedia({
          audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
          }
        }).then((microphoneStream) => {
          // preparing mic and di track nodes for quicker future switching
          const audioElement = diAudioRef.current;
          diTrackStreamSourceRef.current = audioContext.createMediaElementSource(audioElement);

          microphoneStreamNodeRef.current = audioContext.createMediaStreamSource(microphoneStream);

          if (window.useDiTrack) {
            diTrackStreamSourceRef.current.connect(inputGainNodeRef.current);
          } else {
            microphoneStreamNodeRef.current.connect(inputGainNodeRef.current);
          }

          inputGainNodeRef.current.connect(audioWorkletNode);
          audioWorkletNode.connect(outputGainNodeRef.current);
          outputGainNodeRef.current.connect(audioContext.destination);
        }).catch((err) => {
          console.log('Error occured during input connecting', err);
        });
      }
    };
  }, []);

  useEffect(() => {
    // if input mode is changed manually from the DOM
    if (useDiTrack !== null && microphoneStreamNodeRef.current && diTrackStreamSourceRef.current && inputGainNodeRef.current) {
      if (useDiTrack) {
        microphoneStreamNodeRef.current.disconnect(inputGainNodeRef.current);
        diTrackStreamSourceRef.current.connect(inputGainNodeRef.current);
      } else {
        diTrackStreamSourceRef.current.disconnect(inputGainNodeRef.current);
        microphoneStreamNodeRef.current.connect(inputGainNodeRef.current);
      }
    }

    window.useDiTrack = useDiTrack;
  }, [useDiTrack]);

  const onProfileInput = (event) => {
    readProfile(event).then((profile) => {
      loadProfile(profile);
    }).catch((err) => {
      console.log(err);
    });
  };

  const onInputModeChange = (e) => {
    if (e.target.checked) {
      setUseDiTrack(true);
    } else {
      setUseDiTrack(false);
    }
  };

  const removeIr = () => {
    if (audioContext && ir) {
      audioWorkletNode.disconnect(ir);
      ir.disconnect(outputGainNodeRef.current);
      audioWorkletNode.connect(outputGainNodeRef.current);
    }

    setIr(false);
  };

  const setUseIr = (e) => {
    const shouldUse = e.target.checked === true;

    if (shouldUse) {
      setIr(null);
    } else {
      removeIr();
    }
  };

  const handleSetInputGain = (val) => {
    const linearGain = calcDbToLinear(val);
    inputGainRef.current = linearGain;

    if (inputGainNodeRef.current) {
      inputGainNodeRef.current.gain.value = linearGain;
    }
  };

  const handleSetOutputGain = (val) => {
    const linearGain = calcDbToLinear(val);
    outputGainRef.current = linearGain;

    if (outputGainNodeRef.current) {
      outputGainNodeRef.current.gain.value = linearGain;
    }
  };

  return (
    <div className="app" {...stylex.props(styles.app)}>
      {/* Just another way to resume audioContext from wasm glue code */}
      <button id="audio-worklet-resumer" {...stylex.props(styles.workletResumer)} disabled={window.audioWorkletNode}>Start/Resume playing</button>
      <Announcement />
      <div {...stylex.props(styles.amp)}>
        <h3 {...stylex.props(styles.ampTitle)}>Neural Amp Modeler Online</h3>
        <div {...stylex.props(styles.ampControls)}>
          <KnobPercentage label="Input" onChange={handleSetInputGain} />
          <KnobPercentage label="Output" onChange={handleSetOutputGain} />
        </div>
        <div>
          <p>
            <label htmlFor="profile">Choose NAM profile</label>
          </p>
          <input type="file" id="profile" accept=".nam" onChange={onProfileInput} />
        </div>
      </div>
      <div>
        <label htmlFor="input-mode">Use DI track for testing (bypasses microphone)</label>
        <input type="checkbox" id="input-mode" onChange={onInputModeChange} />
      </div>
      <div>
        <label htmlFor="use-ir">Use impulse response</label>
        <input id="use-ir" type="checkbox" onClick={setUseIr} />
      </div>
      {
        ir !== false &&
        <div>
          <label htmlFor="ir">Choose ir</label>
          <input type="file" id="ir" accept="audio/*" onChange={onIRInput} disabled={!audioContext} />
        </div>
      }
      <audio controls ref={diAudioRef}>
        <source src={`${process.env.PUBLIC_URL}/LasseMagoDI.mp3`} type="audio/mpeg" />
      </audio>
      <div>
        {
          audioContext &&
          <>
            <p>Base latency: {audioContext.baseLatency * 1000}ms</p>
            <p>Output latency: {audioContext.outputLatency * 1000}ms</p>
          </>
        }
      </div>

      <Analytics />
      <SpeedInsights />

      <Footer />
    </div>
  );
}

export default App;
