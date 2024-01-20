import { KnobBase } from './KnobBase';

export function KnobPercentage(props) {
  return (
    <KnobBase
      valueDefault={valueDefault}
      valueMin={valueMin}
      valueMax={valueMax}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={valueRawDisplayFn}
      {...props}
    />
  );
}

const valueMin = -20;
const valueMax = 20;
const valueDefault = 0;
const stepFn = (valueRaw) => 1;
const stepLargerFn = (valueRaw) => 10;
const valueRawRoundFn = Math.round;
const valueRawDisplayFn = (valueRaw) =>
  `${valueRawRoundFn(valueRaw)}dB`;
  