import { KnobBase } from './KnobBase';

export function KnobPercentage(props) {
  const valueRawDisplayFn = (valueRaw) =>
    `${valueRawRoundFn((valueRaw / props.valueMax) * 100)}%`;

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
