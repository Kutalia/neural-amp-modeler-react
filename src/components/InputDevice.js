import { useState, useRef, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const InputDevice = ({ handleStream }) => {
  const devicesRef = useRef();
  const [selectedIndex, setSelectedIndex] = useState();
  const needsToAskRef = useRef(true);

  const getStreamByDeviceId = useCallback(async (deviceId) => {
    const audioProps = {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    };

    if (deviceId) {
      audioProps.deviceId = deviceId;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: audioProps,
      });

      return mediaStream;
    } catch (err) {
      console.error('Error acquiring users input stream', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // set default input for the first time
    // to avoid stacking multiple permission asks
    if (needsToAskRef.current) {
      needsToAskRef.current = false;
      getStreamByDeviceId().then((stream) => {
        if (stream) {
          // if media permissions successfuly invoked, enumerate devices
          window.navigator.mediaDevices
            .enumerateDevices()
            .then((devices) =>
              devices.filter((device) => device.kind === 'audioinput')
            ).then((devices) => {
              if (devices.length) {
                devicesRef.current = devices;
                setSelectedIndex(0);
                handleStream(stream);
              }
            });
        }
      });
    }
  }, [getStreamByDeviceId, selectedIndex, handleStream]);

  const selectDevice = async (e) => {
    const index = e.target.value;

    setSelectedIndex(Number(index));

    const stream = await getStreamByDeviceId(devicesRef.current[index].deviceId);
    if (stream) {
      handleStream(stream);
    }
  };

  return (
    <div {...stylex.props(styles.inputDeviceWrapper)}>
      <p>Select an Input Device</p>
      <select
        onChange={selectDevice}
        value={selectedIndex}
        {...stylex.props(styles.inputDevice)}
      >
        {devicesRef.current && devicesRef.current.map((device, index) => (
          <option key={device.deviceId} value={index}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
};
