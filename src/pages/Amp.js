import { useRef, useState, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';

import '../normalize.css';
import { getCabConvolver } from '../helpers/getCabConvolver';
import { readProfile } from '../helpers/readProfile';
import { styles } from '../styles';
import { KnobDb } from '../components/knob/KnobDb';
import { Announcement } from '../components/Announcement';
import { calcDbToLinear } from '../helpers/scaleDb';
import { Footer } from '../components/Footer';
import { DirectorySelect } from '../components/DirectorySelect';
import { InputDevice } from '../components/InputDevice';
import { useDownloadProfiles } from '../hooks/useDownloadProfiles';
import { useModule } from '../hooks/useModule';
import { FileTree } from '../components/FileTree';
import { FrequencyMeter } from '../components/spectrogram/FrequencyMeter';
import { AudioMeter } from '../components/AudioMeter';
import { setupVisualizer } from '../components/AudioVisualizer';
import { Reverb } from '../components/Reverb';
import { ControlsCategorySwitch } from '../components/ControlsCategorySwitch';
import { categories } from '../components/ControlsCategorySwitch';
import { Tuner } from '../components/tuner/Tuner';
import { Delay } from '../components/Delay';
import { downloadDefaultProfile } from '../helpers/downloadDefaultProfile';

export const Amp = () => {
  const [ir, setIr] = useState(false);
  const [useIr, setUseIr] = useState(false);
  const [audioWorkletNode, setAudioWorkletNode] = useState();
  const [microphoneStream, setMicrophoneStream] = useState();
  const [profileLoading, setProfileLoading] = useState(false);
  const [useRightChannel, setUseRightChannel] = useState(false);
  const [loadedProfiles, setLoadedProfiles] = useState({ files: null, index: null });
  const [loadedIrs, setLoadedIrs] = useState({ files: null, index: null });
  const [controlsCategory, setControlsCategory] = useState(categories[0]);
  const [postFxNodes, setPostFxNodes] = useState(Array(2));
  const { profiles: downloadedProfiles, irs: downloadedIrs, loading: downloading } = useDownloadProfiles();
  const modulePromise = useModule();

  // using these refs allow gettig latest values in microphone permission request handler which can be called anytime
  const audioContextRef = useRef();
  const useDiTrackRef = useRef();

  const diAudioRef = useRef();
  const microphoneStreamNodeRef = useRef();
  const diTrackStreamNodeRef = useRef();
  const inputGainNodeRef = useRef();
  const inputGainRef = useRef(1); // linear expression
  const outputGainNodeRef = useRef();
  const outputGainRef = useRef(1);
  const inputChannelMergerRef = useRef();
  const inputChannelSplitterRef = useRef();
  const visualizerRef = useRef();

  const audioContext = audioContextRef.current;
  const nodeWorkletConnectedTo = postFxNodes[postFxNodes.length - 1] ? postFxNodes[postFxNodes.length - 1] : outputGainNodeRef.current;

  const onCabChange = useCallback((cabConvolver) => {
    audioContext.resume();

    // disconnect old impulse response
    if (ir) {
      try {
        // if previously inactive
        audioWorkletNode.disconnect(nodeWorkletConnectedTo);
        // if previously active
        audioWorkletNode.disconnect(ir);
        ir.disconnect(nodeWorkletConnectedTo);
      } catch {

      }
    }
    // disconnect cabinetless full-rig nam to reconnect it to ir
    else {
      audioWorkletNode.disconnect(nodeWorkletConnectedTo);
    }

    audioWorkletNode.connect(cabConvolver);
    cabConvolver.connect(nodeWorkletConnectedTo);
    setIr(cabConvolver);
  }, [audioContext, audioWorkletNode, ir, nodeWorkletConnectedTo]);

  const loadIr = useCallback((file, isCachedIr) => {
    if (audioContext) {
      file.arrayBuffer()
        .then(buffer => getCabConvolver(audioContext, buffer, onCabChange, ir));
    }

    if (!isCachedIr) {
      setLoadedIrs((irs) => ({
        files: irs.files,
        index: null,
      }));
    }
  }, [ir, audioContext, onCabChange]);

  const loadProfile = useCallback(async (file) => {
    setProfileLoading(true);

    const jsonStr = await readProfile(file);

    modulePromise.then((Module) => {
      const ptr = Module._malloc(jsonStr.length + 1);
      Module.stringToUTF8(jsonStr, ptr, jsonStr.length + 1);

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

        setProfileLoading(false);
      });
    });
  }, [modulePromise, audioContext]);

  useEffect(() => {
    if (!audioWorkletNode) {
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
        // duplication the connection on the second audio merger channel as well to retain original audio level instead of cutting in half
        inputChannelSplitterRef.current.connect(inputChannelMergerRef.current, useRightChannel ? 1 : 0, 1);

        inputChannelMergerRef.current.connect(inputGainNodeRef.current);
        inputGainNodeRef.current.connect(audioWorkletNode);
        audioWorkletNode.connect(outputGainNodeRef.current);
        outputGainNodeRef.current.connect(audioContext.destination);

        const visualizer = setupVisualizer(visualizerRef.current, audioContext);
        outputGainNodeRef.current.connect(visualizer);
      };
    }
  }, [audioWorkletNode, useRightChannel, microphoneStream]);

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
      ir.disconnect(nodeWorkletConnectedTo);
      audioWorkletNode.connect(nodeWorkletConnectedTo);
    }

    setUseIr(false);
  };

  const handleUseIrChange = (e) => {
    const shouldUse = e.target.checked === true;

    if (shouldUse) {
      setUseIr(true);
      // if ir was manually uploaded
      if (ir && loadedIrs.index == null) {
        onCabChange(ir);
      } else {
        if (loadedIrs.files) {
          loadIr(loadedIrs.files[loadedIrs.index || 0], true);
        }
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

  const handleSetNoiseGateThreshold = (val) => {
    if (window._setNoiseGateThreshold) {
      window._setNoiseGateThreshold(val);
    }
  };

  const handleSetNoiseGateState = (e) => {
    const useGate = !!e.target.checked;
    if (window._setNoiseGateState) {
      window._setNoiseGateState(useGate);
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

    setMicrophoneStream(stream);
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
  };

  const handleDiTrackUpload = (file) => {
    const blobUrl = URL.createObjectURL(file);
    diAudioRef.current.src = blobUrl;
    diAudioRef.current.play();
  };

  const handleLoadProfiles = useCallback((files, index) => {
    setLoadedProfiles({ files, index });
    loadProfile(files[index]);
  }, [loadProfile]);

  const handleLoadIrs = useCallback((files, index) => {
    setLoadedIrs({ files, index });
    if (useIr) {
      loadIr(files[index], true);
    }
  }, [loadIr, useIr]);

  useEffect(() => {
    // only load downloaded files if no previous profiles were loaded manually
    // this improves ux by not replacing manually inputted files and avoids rerenders bugs related to everchanging dependency refs
    if (!loadedProfiles.files && downloadedProfiles) {
      handleLoadProfiles(downloadedProfiles, 0);
    }

    if (!loadedIrs.files && downloadedIrs) {
      handleLoadIrs(downloadedIrs, 0);
    }
  }, [loadProfile, downloadedProfiles, downloadedIrs, loadedProfiles, loadedIrs, handleLoadProfiles, handleLoadIrs]);

  const loadDefaultProfile = async () => {
    if (!loadedProfiles.files?.length && !profileLoading && !downloading) {
      const profile = await downloadDefaultProfile();
      handleLoadProfiles([profile], 0);
    }
  };

  return (
    <div className="app" {...stylex.props(styles.ampWrapper)}>
      <Announcement />

      <FileTree loadProfiles={handleLoadProfiles} loadIrs={handleLoadIrs} loading={profileLoading || downloading} refetch={!downloading} />

      {/* Manual user interaction needed if profiles are preloaded (downloading, storage, etc.) */}
      <button id="audio-worklet-resumer" disabled={window.audioWorkletNode || profileLoading || downloading} onClick={loadDefaultProfile}>Start/Resume playing</button>

      <div {...stylex.props(styles.amp)}>
        <h3>Neural Amp Modeler Online</h3>

        <ControlsCategorySwitch onChange={setControlsCategory} selectedCategory={controlsCategory} />
        <div {...stylex.props(styles.ampControls, controlsCategory !== categories[0] && styles.hide)}>
          <AudioMeter audioSource={inputGainNodeRef.current} />
          <KnobDb label="Input" onChange={handleSetInputGain} />
          <KnobDb
            label={<div>Gate&nbsp;<input type="checkbox" defaultChecked onChange={handleSetNoiseGateState} /></div>}
            onChange={handleSetNoiseGateThreshold} valueMin={-100} valueMax={0} valueDefault={-80}
          />
          <KnobDb label="Output" onChange={handleSetOutputGain} />
          <AudioMeter audioSource={outputGainNodeRef.current} />
        </div>
        <div {...stylex.props(controlsCategory !== categories[1] && styles.hide)}>
          <Delay
            audioContext={audioContext}
            sourceNode={useIr && ir ? ir : audioWorkletNode}
            destinationNode={postFxNodes[1] || outputGainNodeRef.current}
            onNodeChange={setPostFxNodes}
            postFxIndex={0}
          />
        </div>
        <div {...stylex.props(controlsCategory !== categories[2] && styles.hide)}>
          <Reverb
            audioContext={audioContext}
            sourceNode={postFxNodes[0] || (useIr && ir ? ir : audioWorkletNode)}
            destinationNode={outputGainNodeRef.current}
            onNodeChange={setPostFxNodes}
            postFxIndex={1}
          />
        </div>
        {controlsCategory === categories[3] && <Tuner audioStream={microphoneStream} useRightChannel={useRightChannel} />}

        <DirectorySelect
          label="Choose NAM profile"
          fileExts={['.nam']}
          onFileSelect={loadProfile}
          defaultIndex={loadedProfiles.index == null ? 0 : loadedProfiles.index}
          defaultFiles={loadedProfiles.files}
          disabled={profileLoading || downloading || (downloadedProfiles && !audioContext)}
          dark
        />
        <DirectorySelect
          label={<>
            <span>Use IR (upload after profile)&nbsp;</span>
            <input id="use-ir" type="checkbox" onClick={handleUseIrChange} disabled={!audioWorkletNode} />
          </>}
          fileExts={['.wav']}
          onFileSelect={loadIr}
          defaultIndex={loadedIrs.index == null ? 0 : loadedIrs.index}
          // to eliminate a race condition between setting the first profile and the first ir
          defaultFiles={loadedIrs.files}
          disabled={useIr === false || profileLoading || !audioContext || downloading}
          dark
        />
        <canvas ref={visualizerRef} width={300} {...stylex.props(styles.visualizer, !audioContext && styles.hiddenVisualizer)} />
      </div>
      <div>
        <label htmlFor="input-mode">Use DI track for testing (bypasses microphone)&nbsp;</label>
        <input type="checkbox" id="input-mode" onChange={onInputModeChange} />
      </div>

      <DirectorySelect
        label="Choose your DI track"
        fileExts={['.wav', '.mp3']}
        onFileSelect={handleDiTrackUpload}
      />
      <audio controls ref={diAudioRef}>
        <source src={`${process.env.PUBLIC_URL}/Drop_D_Riff.mp3`} type="audio/mpeg" />
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

      {window.document.body.clientWidth > 1000 && <FrequencyMeter audioSource={outputGainNodeRef.current} />}

      <InputDevice handleStream={handleMicrophoneStreamChange} />
      <p>
        <label htmlFor="use-right-channel">
          Use Right Channel <small>(try this if you're connected to a channel on an even position: Input 2, Input 4, etc.)</small>
        </label>
        &nbsp;
        <input type="checkbox" id="use-right-channel" onChange={handleMicrophoneChannelChange} />
      </p>

      <Footer />
    </div>
  );
};
