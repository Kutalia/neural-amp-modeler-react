import { useRef, useState } from 'react';

import { getCabConvolver } from './helpers/getCabConvolver';
import './App.css';
import { readProfile } from './helpers/readProfile';

let audioContext, audioWorkletNode;

window.wasmAudioWorkletCreated = (node1, node2) => {
  audioWorkletNode = node1;
  audioContext = node2;

  const resumerBtn = document.getElementById('audio-worklet-resumer')

  if (resumerBtn) {
    resumerBtn.disabled = false;
  }
};

function App() {
  const diAudioRef = useRef();
  const [useDi, setUseDi] = useState(false);
  const [irReady, setIrReady] = useState(false);
  const [dspRunning, setDspRunning] = useState(false);
  const [audioResumed, setAudioResumed] = useState(false);

  const onCabReady = async (cabConvolver) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
      }
    });

    audioContext.resume();

    if (useDi) {
      const audioElement = diAudioRef.current;
      const diTrackStreamSource = audioContext.createMediaElementSource(audioElement);
      diTrackStreamSource.connect(audioWorkletNode);
    } else {
      const microphoneStreamNode = audioContext.createMediaStreamSource(stream);
      microphoneStreamNode.connect(audioWorkletNode);
    }

    audioWorkletNode.connect(cabConvolver);
    cabConvolver.connect(audioContext.destination);
    setIrReady(true);
  };

  const onIRInput = (event) => {
    if (audioContext && event.target.files?.length) {
      event.target.files[0].arrayBuffer().then(buffer => getCabConvolver(audioContext, buffer, onCabReady));
    }
  };

  const loadProfile = (profile) => {
    window.setDsp = (jsonStr) => {
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
    window.setDsp(profile);
    setDspRunning(true);
  };

  const onResume = () => {
    setAudioResumed(true);
  };

  const onProfileInput = (event) => {
    readProfile(event).then((profile) => {
      loadProfile(profile);
    });
  };

  return (
    <div className="App">
      <button id="audio-worklet-resumer" onClick={onResume} disabled={!!window.audioWorkletNode}>Start playing</button>
      <div>
        <label htmlFor="profile">Choose NAM profile</label>
        <input type="file" id="profile" accept=".nam" onChange={onProfileInput} disabled={!audioResumed} />
      </div>
      <div>
        <label htmlFor="ir">Choose ir</label>
        <input type="file" id="ir" accept="audio/*" onChange={onIRInput} disabled={!dspRunning || irReady} />
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
