import { useRef, useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as stylex from '@stylexjs/stylex';

import { getCabConvolver } from './helpers/getCabConvolver';
import { readProfile } from './helpers/readProfile';
import { styles } from './styles';

function App() {
  const diAudioRef = useRef();
  const [useDiTrack, setUseDiTrack] = useState(null);
  const [ir, setIr] = useState(false);
  const [audioContext, setAudioContext] = useState();
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamSource = useRef();

  const onCabChange = (cabConvolver) => {
    audioContext.resume();

    // disconnect old impulse response
    if (ir) {
      audioWorkletNode.disconnect(ir);
      ir.disconnect(audioContext.destination);
    }
    // disconnect full-rig nam
    else {
      audioWorkletNode.disconnect(audioContext.destination);
    }

    audioWorkletNode.connect(cabConvolver);
    cabConvolver.connect(audioContext.destination);
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
      setAudioWorkletNode(node1);
      setAudioContext(node2);

      // initializing various web audio nodes when user is interacting for the first time

      if (!microphoneStreamNodeRef.current) {
        const audioWorkletNode = node1;
        const audioContext = node2;

        navigator.mediaDevices.getUserMedia({
          audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false,
          }
        }).then((microphoneStream) => {
          // preparing mic and di track nodes for quicker future switching
          const audioElement = diAudioRef.current;
          diTrackStreamSource.current = audioContext.createMediaElementSource(audioElement);

          microphoneStreamNodeRef.current = audioContext.createMediaStreamSource(microphoneStream);

          if (window.useDiTrack) {
            diTrackStreamSource.current.connect(audioWorkletNode);
          } else {
            microphoneStreamNodeRef.current.connect(audioWorkletNode);
          }

          audioWorkletNode.connect(audioContext.destination);
        }).catch((err) => {
          console.log('Error occured during input connecting', err);
        });
      }
    };
  }, []);

  useEffect(() => {
    // if input mode is changed manually from the DOM
    if (useDiTrack !== null && microphoneStreamNodeRef.current && diTrackStreamSource.current && audioWorkletNode) {
      if (useDiTrack) {
        microphoneStreamNodeRef.current.disconnect(audioWorkletNode);
        diTrackStreamSource.current.connect(audioWorkletNode);
      } else {
        diTrackStreamSource.current.disconnect(audioWorkletNode);
        microphoneStreamNodeRef.current.connect(audioWorkletNode);
      }
    }

    window.useDiTrack = useDiTrack;
  }, [useDiTrack, audioWorkletNode]);

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
      ir.disconnect(audioContext.destination);
      audioWorkletNode.connect(audioContext.destination);
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

  return (
    <div className="app" {...stylex.props(styles.app)}>
      {/* Just another way to resume audioContext from wasm glue code */}
      <button id="audio-worklet-resumer" disabled={window.audioWorkletNode}>Start/Resume playing</button>
      <div>
        <label htmlFor="input-mode">Use DI track for testing (bypasses microphone)</label>
        <input type="checkbox" id="input-mode" onChange={onInputModeChange} />
      </div>
      <div>
        <label htmlFor="profile">Choose NAM profile</label>
        <input type="file" id="profile" accept=".nam" onChange={onProfileInput} />
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
    </div>
  );
}

export default App;
