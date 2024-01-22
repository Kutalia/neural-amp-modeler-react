import { useState, useEffect, useCallback } from 'react';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const InputDevice = ({ handleStream }) => {
  const [devices, setDevices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();

  const setStreamByDeviceId = useCallback(async (deviceId) => {
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
      handleStream(mediaStream);

      return mediaStream;
    } catch (err) {
      console.error('Error acquiring users input stream', err);
      return null;
    }
  }, [handleStream]);

  useEffect(() => {
    // set default input for the first time
    if (typeof selectedIndex !== 'number') {
      setStreamByDeviceId().then((result) => {
        if (result) {
          // if media permissions successfuly invoked, enumerate devices
          window.navigator.mediaDevices
            .enumerateDevices()
            .then((devices) =>
              devices.filter((device) => device.kind === 'audioinput')
            ).then((devices) => {
              if (devices.length) {
                setDevices(devices);
                setSelectedIndex(0);
              }
            });
        }
      });
    }
  }, [setStreamByDeviceId, selectedIndex]);

  const selectDevice = async (e) => {
    const index = e.target.value;

    setSelectedIndex(Number(index));

    setStreamByDeviceId(devices[index].deviceId);
  };

  return (
    <div {...stylex.props(styles.inputDeviceWrapper)}>
      <p>Select an Input Device</p>
      <select
        onChange={selectDevice}
        value={selectedIndex}
        {...stylex.props(styles.inputDevice)}
      >
        {devices.map((device, index) => (
          <option key={device.deviceId} value={index}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );
};
