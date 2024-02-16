import * as stylex from '@stylexjs/stylex';

import { styles } from '../../styles';
import { SemiCircleProgress } from '../SemiCircleProgress';

export const RangeBar = ({ value }) => {
  if (-5 <= value && value <= 5) {
    value = 50;
  } else if (value < 0) {
    value = 50 - Math.abs(value);
  } else {
    value = value + 50;
  }

  return (
    <div {...stylex.props(styles.rangeBar)}>
      <SemiCircleProgress
        percentage={value}
        background={"#D85050"}
        orientation={"down"}
        diameter={250}
      />
    </div>
  );
};
