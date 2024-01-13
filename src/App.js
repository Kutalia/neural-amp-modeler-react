import { useRef, useState } from 'react';

import { getCabConvolver } from './helpers/getCabConvolver';
import './App.css';
import { readProfile } from './helpers/readProfile';

function App() {
  const diAudioRef = useRef();
  const [useDi, setUseDi] = useState(false);
  const [ir, setIr] = useState();
  const [audioContext, setAudioContext] = useState();
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamSource = useRef();

  const onCabChange = (cabConvolver) => {
    audioContext.resume();

    // disconnect old impulse response
    if (ir) {
      audioWorkletNode.disconnect();
      ir.disconnect();
    }

    audioWorkletNode.connect(cabConvolver);
    cabConvolver.connect(audioContext.destination);
    setIr(cabConvolver);
  };

  const onIRInput = (event) => {
    if (audioContext && event.target.files?.length) {
      event.target.files[0].arrayBuffer().then(buffer => getCabConvolver(audioContext, buffer, onCabChange));
    }
  };

  const loadProfile = (jsonStr) => {
    const { Module } = window
    const ptr = Module._malloc(jsonStr.length + 1);
    Module.stringToUTF8(jsonStr, ptr, jsonStr.length + 1)

    if (audioContext) {
      audioContext.suspend();
    }

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
          if (useDi && !diTrackStreamSource.current) {
            const audioElement = diAudioRef.current;
            diTrackStreamSource.current = audioContext.createMediaElementSource(audioElement);
            diTrackStreamSource.current.connect(audioWorkletNode);
          } else if (!microphoneStreamNodeRef.current) {
            microphoneStreamNodeRef.current = audioContext.createMediaStreamSource(microphoneStream);
            microphoneStreamNodeRef.current.connect(audioWorkletNode);
          }
        }).catch((err) => {
          console.log('Please allow your guitar input from the browser');
        });
      }
    };

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

  const onProfileInput = (event) => {
    readProfile(event).then((profile) => {
      loadProfile(profile);
    });
  };

  return (
    <div className="App">
      {/* Just another way to resume audioContext from wasm glue code */}
      <button id="audio-worklet-resumer" disabled={window.audioWorkletNode}>Start/Resume playing</button>
      <div>
        <label htmlFor="profile">Choose NAM profile</label>
        <input type="file" id="profile" accept=".nam" onChange={onProfileInput} />
      </div>
      <div>
        <label htmlFor="ir">Choose ir</label>
        <input type="file" id="ir" accept="audio/*" onChange={onIRInput} disabled={!audioContext} />
        <p>Please reload page to change IR</p>
      </div>
      {
        useDi &&
        <audio controls ref={diAudioRef}>
          <source src={`${process.env.PUBLIC_URL}/LasseMagoDI.mp3`} type="audio/mpeg" />
        </audio>
      }
    </div>
  );
}

export default App;
