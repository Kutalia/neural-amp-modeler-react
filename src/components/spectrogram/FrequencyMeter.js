import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './FrequencyMeter.css';

const LEGEND_FONT_SIZE = 8;

export const FrequencyMeter = (props) => {
  const frequencyRef = useRef();
  const _frequencyNodeRef = useRef();
  const _audioAnalyserRef = useRef();
  const audioSourceRef = useRef();
  const _playingIntervalRef = useRef();

  useEffect(() => {
    _frequencyNodeRef.current = ReactDOM.findDOMNode(frequencyRef.current);
  }, []);

  useEffect(() => {
    const { audioSource } = props;

    if (_audioAnalyserRef.current && audioSourceRef.current !== audioSource) {
      _audioAnalyserRef.current.disconnect();

      clearInterval(_playingIntervalRef.current);
      _audioAnalyserRef.current = null;
    }

    if (audioSource && audioSourceRef.current !== audioSource) {
      _audioAnalyserRef.current = createAnalyzer(props);

      const { latency, width, height, fftSize } = props;

      _playingIntervalRef.current = startTimer(
        {
          audioSource,
          audioAnalyser: _audioAnalyserRef.current,
          latency,
          width,
          height,
          fftSize,
          domNode: _frequencyNodeRef.current
        });
    }

    audioSourceRef.current = audioSource;
  }, [props]);

  const { width, height, freqAxis, dbAxis } = props;
  const { min, max, grid, labelGrid } = freqAxis;

  const minp = 0;
  const maxp = width;

  const minv = Math.log(min);
  const maxv = Math.log(max);

  const scale = calcRatio(minv, maxv, minp, maxp);

  const freqGrid = plotFreqGrid({ grid, scale, height });
  const freqLabels = plotFreqLabelGrid({ labelGrid, scale });
  const dbGrid = plotDbLabelGrid({
    min: dbAxis.min,
    max: dbAxis.max,
    grid: dbAxis.grid,
    height
  });

  return (
    <svg className="frequency-meter" height={height} width={width}>
      {freqGrid}
      {freqLabels}
      {dbGrid}
      <path fill="transparent" ref={frequencyRef}></path>
    </svg>
  );
};

FrequencyMeter.propTypes = {
  audioSource: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  bandsCount: PropTypes.number,
  latency: PropTypes.number,
  fftSize: PropTypes.number,
  freqAxis: PropTypes.object,
  dbAxis: PropTypes.object,
  smoothingTimeConstant: PropTypes.number
};

FrequencyMeter.defaultProps = {
  audioSource: null,
  width: 800,
  height: 300,
  bandsCount: 1024,
  latency: 20,
  fftSize: 1024 * 2,
  freqAxis: {
    min: 20,
    max: 23000,
    grid: [50, 100, 200, 500, 1000, 2000, 5000, 10000],
    labelGrid: [40, 100, 200, 400, 600, 1000, 2000, 4000, 6000, 10000]
  },
  dbAxis: {
    min: -100,
    max: 0,
    grid: [-80, -60, -40, -20],
    labelGrid: []
  },
  smoothingTimeConstant: 0.95
};

/**
 * Creates a ratio instance.
 *
 * @maxValue {number} Max value.
 * @minValue {number} Min value.
 * @maxBound {number} Max bound size
 * @minBound {number} Min bound size
 * @return {Scale} The new Scale object.
 */
export function calcRatio(minValue, maxValue, minBound, maxBound) {
  const value = (maxValue - minValue) / (maxBound - minBound);

  return {
    maxValue,
    minValue,
    maxBound,
    minBound,
    value
  };
}

export function scaleValue(value, scale) {
  return Math.ceil((value - scale.minValue) / scale.value + scale.minBound);
}

function plotFreqGrid({ grid, scale, height }) {
  const freqGrid = [];
  for (const f of grid) {
    const x = scaleValue(Math.log(f), scale);

    const line = (
      <line
        key={f}
        strokeWidth="1"
        x1={x}
        x2={x}
        y1={0}
        y2={height}
      >
      </line>
    );

    freqGrid.push(line);
  }

  return freqGrid;
}

function plotFreqLabelGrid({ labelGrid, scale }) {
  const freqLabels = [];
  for (const f of labelGrid) {
    const x = scaleValue(Math.log(f), scale) - 10;

    const text = (
      <text
        key={f}
        x={x}
        y={LEGEND_FONT_SIZE}
      >
        {f < 1000 ? f : `${f / 1000}k`}
      </text>);

    freqLabels.push(text);
  }


  return freqLabels;
}

function plotDbLabelGrid({ min, max, grid, height }) {
  const minp = 0;
  const maxp = height;

  const minv = min;
  const maxv = max;

  const scale = calcRatio(minv, maxv, minp, maxp);

  const dbGrid = [];
  for (const f of grid) {
    const y = maxp - scaleValue(f, scale);

    const text = (
      <text
        key={f}
        x={0}
        y={y + LEGEND_FONT_SIZE / 2}
      >
        {Math.abs(f)}
      </text>);

    dbGrid.push(text);
  }

  return dbGrid;
}

function createAnalyzer({ audioSource, fftSize, dbAxis, smoothingTimeConstant }) {
  if (!audioSource) {
    throw new Error('audioSource is expected');
  }

  const { min, max } = dbAxis;
  const audioAnalyser = audioSource.context.createAnalyser();

  audioAnalyser.fftSize = fftSize;
  audioAnalyser.minDecibels = min;
  audioAnalyser.maxDecibels = max;
  audioAnalyser.smoothingTimeConstant = smoothingTimeConstant;

  // TODO make stereo option
  audioSource.connect(audioAnalyser, 0, 0);

  return audioAnalyser;
}

function startTimer({ audioSource, audioAnalyser, latency, width, height, fftSize, domNode }) {
  const playingInterval = setInterval(
    renderFrame.bind(this, audioAnalyser, width, height, fftSize, domNode),
    latency);

  /* eslint-disable no-param-reassign */
  audioSource.onended = () => {
    clearInterval(playingInterval);
  };

  return playingInterval;
}

function renderFrame(analyser, width, height, fftSize, domNode) {
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);

  const frameParams = {
    width,
    height,
    data: frequencyData,
    maxValue: 255
  };

  domNode.setAttribute('d', getLogPathData(frameParams));
}

/**
 * Gets path data that fits to the rectangle box, ex. M0,12L1,0Z.
 * It gets histogram data array and represents it logariphmic.
 *
 * @width {number} Box width
 * @height {number} Box height
 * @maxValue {number} Max data value
 * @data {array} Min bound size
 * @return {string} String representation of data.
 */
export function getLogPathData({ width, height, data, maxValue }) {
  let stringValue = `M0,${height}`;

  const ratio = calcRatio(Math.log(1), Math.log(data.length), 0, width);

  for (let i = 0; i < data.length; i++) {
    const value = data[i];

    let x = 0;

    if (i) {
      x = scaleValue(Math.log(i), ratio);
    }

    const h = (height * value) / maxValue;
    const y = height - h;

    stringValue += `L${x},${y}`;
  }

  return `${stringValue}Z`;
}