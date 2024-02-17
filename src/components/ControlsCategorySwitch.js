import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const categories = ['Amp', 'Delay', 'Reverb', 'Tuner'];

export const ControlsCategorySwitch = ({ onChange, selectedCategory }) => {
  return (
    <div {...stylex.props(styles.controlsCategorySwitch)}>
      {categories.map((category) => (
        <span
          key={category}
          {...stylex.props(styles.controlsCategory, selectedCategory === category && styles.controlsCategoryActive)}
          onClick={() => onChange(category)}>
          {category}
        </span>
      ))}
    </div>
  )
};
