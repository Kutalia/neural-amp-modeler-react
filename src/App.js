import { useRef, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as stylex from '@stylexjs/stylex';

import './normalize.css';
import { getCabConvolver } from './helpers/getCabConvolver';
import { readProfile } from './helpers/readProfile';
import { styles } from './styles';
import { KnobPercentage } from './components/knob/KnobPercentage';
import { calcDbToLinear } from './helpers/scaleDb';
import { Announcement } from './components/Announcement';
import { Footer } from './components/Footer';
import { DirectorySelect } from './components/DirectorySelect';
import { InputDevice } from './components/InputDevice';

function App() {
  const diAudioRef = useRef();
  const [useDiTrack, setUseDiTrack] = useState(null);
  const [ir, setIr] = useState(false);
  const [audioContext, setAudioContext] = useState();
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const [profileLoading, setProfileLoading] = useState(false);

  const microphoneStreamRef = useRef();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamNodeRef = useRef();
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

  const onIRInput = (file) => {
    if (audioContext) {
      file.arrayBuffer()
        .then(buffer => getCabConvolver(audioContext, buffer, onCabChange, ir));
    }
  };

  const loadProfile = async (file) => {
    setProfileLoading(true);

    const jsonStr = await readProfile(file);

    const { Module } = window
    const ptr = Module._malloc(jsonStr.length + 1);
    Module.stringToUTF8(jsonStr, ptr, jsonStr.length + 1)

    if (audioContext) {
      audioContext.suspend();
    }

    await Module.ccall(
      "setDsp",
      null,
      ["number"],
      [ptr],
      {
        async: true,
      }
    )

    Module._free(ptr);
    if (audioContext) {
      audioContext.resume();
    }

    setProfileLoading(false);
  };

  useEffect(() => {
    window.wasmAudioWorkletCreated = (node1, node2) => {
      const audioWorkletNode = node1;
      const audioContext = node2;

      setAudioWorkletNode(audioWorkletNode);
      setAudioContext(audioContext);

      inputGainNodeRef.current = new GainNode(audioContext, { gain: inputGainRef.current });
      outputGainNodeRef.current = new GainNode(audioContext, { gain: outputGainRef.current });

      // preparing mic and di track nodes for quicker future switching
      const audioElement = diAudioRef.current;
      diTrackStreamNodeRef.current = audioContext.createMediaElementSource(audioElement);

      const microphoneStream = microphoneStreamRef.current;
      let microphoneStreamNode;

      if (microphoneStream) {
        microphoneStreamNode = audioContext.createMediaStreamSource(microphoneStream);
        microphoneStreamNodeRef.current = microphoneStreamNode;
      }

      if (window.useDiTrack) {
        diTrackStreamNodeRef.current.connect(inputGainNodeRef.current);
      } else if (microphoneStream) {
        microphoneStreamNode.connect(inputGainNodeRef.current);
      }

      inputGainNodeRef.current.connect(audioWorkletNode);
      audioWorkletNode.connect(outputGainNodeRef.current);
      outputGainNodeRef.current.connect(audioContext.destination);
    };
  }, []);

  useEffect(() => {
    // if input mode is changed manually from the DOM
    if (useDiTrack !== null && diTrackStreamNodeRef.current && inputGainNodeRef.current) {
      const microphoneStreamNode = microphoneStreamNodeRef.current;

      if (useDiTrack) {
        if (microphoneStreamNode) {
          microphoneStreamNode.disconnect(inputGainNodeRef.current);
        }
        diTrackStreamNodeRef.current.connect(inputGainNodeRef.current);
      } else if (microphoneStreamNode) {
        diTrackStreamNodeRef.current.disconnect(inputGainNodeRef.current);
        microphoneStreamNode.connect(inputGainNodeRef.current);
      }
    }

    window.useDiTrack = useDiTrack;
  }, [useDiTrack]);

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

  const handleMicrophoneStreamChange = (stream) => {
    // dsp already started
    if (audioContext) {
      // only disconnects if previously was used
      try {
        microphoneStreamNodeRef.current.disconnect(inputGainNodeRef.current);
      } catch (err) {

      } finally {
        microphoneStreamNodeRef.current = audioContext.createMediaStreamSource(stream);
      }

      // put new input stream to use
      if (!useDiTrack && inputGainNodeRef.current && diTrackStreamNodeRef.current) {
        try {
          diTrackStreamNodeRef.current.disconnect(inputGainNodeRef.current);
        } catch (err) {

        } finally {
          microphoneStreamNodeRef.current.connect(inputGainNodeRef.current);
        }
      }
    }

    // if dsp is not yet started, it will be used for node creation on start
    microphoneStreamRef.current = stream;
  };

  return (
    <div className="app" {...stylex.props(styles.app)}>
      {/* Just another way to resume audioContext from wasm glue code */}
      <InputDevice handleStream={handleMicrophoneStreamChange} />
      <button id="audio-worklet-resumer" {...stylex.props(styles.workletResumer)} disabled={window.audioWorkletNode}>Start/Resume playing</button>
      <Announcement />
      <div {...stylex.props(styles.amp)}>
        <h3 {...stylex.props(styles.ampTitle)}>Neural Amp Modeler Online</h3>
        <div {...stylex.props(styles.ampControls)}>
          <KnobPercentage label="Input" onChange={handleSetInputGain} />
          <KnobPercentage label="Output" onChange={handleSetOutputGain} />
        </div>
        <DirectorySelect
          label="Choose NAM profile"
          fileExt=".nam"
          onFileSelect={loadProfile}
          disabled={profileLoading}
        />
        <DirectorySelect
          label={<>
            <span>Use IR (upload after profile)&nbsp;</span>
            <input id="use-ir" type="checkbox" onClick={setUseIr} />
          </>}
          fileExt=".wav"
          onFileSelect={onIRInput}
          disabled={ir === false || profileLoading || !audioContext}
        />
      </div>
      <div>
        <label htmlFor="input-mode">Use DI track for testing (bypasses microphone)&nbsp;</label>
        <input type="checkbox" id="input-mode" onChange={onInputModeChange} />
      </div>
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
