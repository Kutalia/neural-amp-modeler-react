import { mapFrom01Linear } from '@dsp-ts/math';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../../styles';

export function KnobBaseThumb({ value01 }) {
  const angleMin = -145;
  const angleMax = 145;
  const angle = mapFrom01Linear(value01, angleMin, angleMax);
  return (
    <div {...stylex.props(styles.knobBaseThumbWrapper)}>
      <div {...stylex.props(styles.knobBaseThumbWrapper2)} style={{ rotate: `${angle}deg` }}>
        <div {...stylex.props(styles.knobBaseThumb)} />
      </div>
    </div>
  );
}
