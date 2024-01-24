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
import { useDownloadProfiles } from './hooks/useDownloadProfiles';

function App() {
  const diAudioRef = useRef();
  const [ir, setIr] = useState(false);
  const [useIr, setUseIr] = useState(false);
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const [profileLoading, setProfileLoading] = useState(false);
  const [useRightChannel, setUseRightChannel] = useState(false);
  const { profiles: downloadedProfiles, irs: downloadedIrs, loading: downloading } = useDownloadProfiles();

  // using these refs allow gettig latest values in microphone permission request handler which can be called anytime
  const audioContextRef = useRef();
  const useDiTrackRef = useRef();

  const microphoneStreamRef = useRef();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamNodeRef = useRef();
  const inputGainNodeRef = useRef();
  const inputGainRef = useRef(1); // linear expression
  const outputGainNodeRef = useRef();
  const outputGainRef = useRef(1);
  const inputChannelMergerRef = useRef();
  const inputChannelSplitterRef = useRef();

  const audioContext = audioContextRef.current;

  const onCabChange = (cabConvolver) => {
    audioContext.resume();

    // disconnect old impulse response
    if (ir) {
      try {
        // if previously inactive
        audioWorkletNode.disconnect(outputGainNodeRef.current);
        // if previously active
        audioWorkletNode.disconnect(ir);
        ir.disconnect(outputGainNodeRef.current);
      } catch {

      }
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
    if (!window.wasmAudioWorkletCreated) {
      window.wasmAudioWorkletCreated = (node1, node2) => {
        const audioWorkletNode = node1;
        const audioContext = node2;

        setAudioWorkletNode(audioWorkletNode);
        audioContextRef.current = audioContext;

        inputGainNodeRef.current = new GainNode(audioContext, { gain: inputGainRef.current });
        outputGainNodeRef.current = new GainNode(audioContext, { gain: outputGainRef.current });

        // preparing track nodes for future switching
        const audioElement = diAudioRef.current;
        diTrackStreamNodeRef.current = audioContext.createMediaElementSource(audioElement);

        inputChannelMergerRef.current = audioContext.createChannelMerger(2);
        inputChannelSplitterRef.current = audioContext.createChannelSplitter(2);

        const microphoneStream = microphoneStreamRef.current;
        let microphoneStreamNode;

        if (microphoneStream) {
          microphoneStreamNode = audioContext.createMediaStreamSource(microphoneStream);
          microphoneStreamNodeRef.current = microphoneStreamNode;
        }

        if (window.useDiTrack) {
          diTrackStreamNodeRef.current.connect(inputChannelSplitterRef.current);
        } else if (microphoneStream) {
          microphoneStreamNode.connect(inputChannelSplitterRef.current);
        }

        inputChannelSplitterRef.current.connect(inputChannelMergerRef.current, useRightChannel ? 1 : 0, 0);
        inputChannelMergerRef.current.connect(inputGainNodeRef.current);
        inputGainNodeRef.current.connect(audioWorkletNode);
        audioWorkletNode.connect(outputGainNodeRef.current);
        outputGainNodeRef.current.connect(audioContext.destination);
      };
    }
  }, [useRightChannel]);

  const onInputModeChange = (e) => {
    const useDiTrack = !!e.target.checked;

    useDiTrackRef.current = useDiTrack;

    // if input mode is changed manually from the DOM
    if (useDiTrack !== null && diTrackStreamNodeRef.current && inputChannelSplitterRef.current) {
      const microphoneStreamNode = microphoneStreamNodeRef.current;

      if (useDiTrack) {
        if (microphoneStreamNode) {
          microphoneStreamNode.disconnect(inputChannelSplitterRef.current);
        }
        diTrackStreamNodeRef.current.connect(inputChannelSplitterRef.current);
      } else {
        diTrackStreamNodeRef.current.disconnect(inputChannelSplitterRef.current);
        if (microphoneStreamNode) {
          microphoneStreamNode.connect(inputChannelSplitterRef.current);
        }
      }
    }

    window.useDiTrack = useDiTrack;
  };

  const removeIr = () => {
    if (audioContext && ir) {
      audioWorkletNode.disconnect(ir);
      ir.disconnect(outputGainNodeRef.current);
      audioWorkletNode.connect(outputGainNodeRef.current);
    }

    setUseIr(false);
  };

  const handleUseIrChange = (e) => {
    const shouldUse = e.target.checked === true;

    if (shouldUse) {
      setUseIr(true);
      if (ir) {
        onCabChange(ir);
      }
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
    if (audioContextRef.current && inputChannelSplitterRef.current) {
      // only disconnects if previously was used
      try {
        microphoneStreamNodeRef.current.disconnect(inputChannelSplitterRef.current);
      } catch (err) {

      } finally {
        microphoneStreamNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      }

      // put new input stream to use
      if (!useDiTrackRef.current && diTrackStreamNodeRef.current) {
        try {
          diTrackStreamNodeRef.current.disconnect(inputChannelSplitterRef.current);
        } catch (err) {

        } finally {
          microphoneStreamNodeRef.current.connect(inputChannelSplitterRef.current);
        }
      }
    }

    // if dsp is not yet started, it will be used for node creation on start
    microphoneStreamRef.current = stream;
  };

  const handleMicrophoneChannelChange = (e) => {
    const useRight = !!e.target.checked;
    setUseRightChannel(useRight);

    const merger = inputChannelMergerRef.current;
    const splitter = inputChannelSplitterRef.current;
    const gain = inputGainNodeRef.current;

    if (splitter && merger && gain) {
      splitter.disconnect(merger, useRight ? 0 : 1, 0);

      splitter.connect(merger, useRight ? 1 : 0, 0);
    }
  }

  return (
    <div className="app" {...stylex.props(styles.app)}>
      {/* Manual user interaction needed if profiles are preloaded (downloading, storage, etc.) */}
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
          defaultFiles={downloadedProfiles}
          disabled={profileLoading || downloading || (downloadedProfiles && !audioContext)}
        />
        <DirectorySelect
          label={<>
            <span>Use IR (upload after profile)&nbsp;</span>
            <input id="use-ir" type="checkbox" onClick={handleUseIrChange} />
          </>}
          fileExt=".wav"
          onFileSelect={onIRInput}
          // to eliminate a race condition between setting the first profile and the first ir
          defaultFiles={audioContext && useIr && downloadedIrs}
          disabled={useIr === false || profileLoading || !audioContext || downloading || (downloadedIrs && !audioContext)}
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

      <InputDevice handleStream={handleMicrophoneStreamChange} />
      <p>
        <label htmlFor="use-right-channel">
          Use Right Channel <small>(try this if you're connected to a channel on an even position: Input 2, Input 4, etc.)</small>
        </label>
        &nbsp;
        <input type="checkbox" id="use-right-channel" onChange={handleMicrophoneChannelChange} />
      </p>

      <Footer />

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
