import { useRef, useState } from 'react';

import { getCabConvolver } from './helpers/getCabConvolver';
import './App.css';
import { readProfile } from './helpers/readProfile';

let audioContext, workletNode;

window.wasmAudioWorkletCreated = (node1, node2) => {
  audioContext = node1;
  workletNode = node2;

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

    workletNode.resume();

    if (useDi) {
      const audioElement = diAudioRef.current;
      const diTrackStreamSource = workletNode.createMediaElementSource(audioElement);
      diTrackStreamSource.connect(audioContext);
    } else {
      const microphoneStreamNode = workletNode.createMediaStreamSource(stream);
      microphoneStreamNode.connect(audioContext);
    }

    audioContext.connect(cabConvolver);
    cabConvolver.connect(workletNode.destination);
    setIrReady(true);
  };

  const onIRInput = (event) => {
    if (workletNode && event.target.files?.length) {
      event.target.files[0].arrayBuffer().then(buffer => getCabConvolver(workletNode, buffer, onCabReady));
    }
  };

  const loadProfile = (profile) => {
    window.setDsp = (jsonStr) => {
      const { Module } = window
      const ptr = Module._malloc(jsonStr.length + 1);
      Module.stringToUTF8(jsonStr, ptr, jsonStr.length + 1)

      if (workletNode) {
        workletNode.suspend();
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
        if (workletNode) {
          workletNode.resume();
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
      <button id="audio-worklet-resumer" onClick={onResume} disabled={!!window.audioContext}>Start playing</button>
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
