import { KnobBase } from './KnobBase';

export function KnobFrequency(props) {
  return (
    <KnobBase
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={valueRawDisplayFn}
      {...props}
    />
  );
}

const stepFn = (valueRaw) => 1;
const stepLargerFn = (valueRaw) => 10;
const valueRawRoundFn = Math.round;
const valueRawDisplayFn = (valueRaw) =>
  `${valueRawRoundFn(valueRaw)}Hz`;
  