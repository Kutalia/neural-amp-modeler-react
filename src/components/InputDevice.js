import { useState, useEffect, useCallback } from 'react';

export const InputDevice = ({ handleStream }) => {
  const [devices, setDevices] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState();

  useEffect(() => {
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
  }, []);

  const setStreamByDeviceId = useCallback((deviceId) => {
    const audioProps = {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false,
    };

    if (deviceId) {
      audioProps.deviceId = deviceId;
    }

    navigator.mediaDevices.getUserMedia({
      audio: audioProps,
    }).then((mediaStream) => {
      handleStream(mediaStream);
    }).catch((err) => {
      console.error('Error acquiring users input stream', err);
    });
  }, [handleStream]);

  useEffect(() => {
    // set default input for the first time
    if (typeof selectedIndex !== 'number') {
      setStreamByDeviceId();
    }
  }, [setStreamByDeviceId, selectedIndex]);

  const selectDevice = async (e) => {
    const index = e.target.value;

    setSelectedIndex(Number(index));

    setStreamByDeviceId(devices[index].deviceId);
  };

  return (
    <select onChange={selectDevice} value={selectedIndex}>
      {devices.map((device, index) => (
        <option key={device.deviceId} value={index}>
          {device.label}
        </option>
      ))}
    </select>
  );
};