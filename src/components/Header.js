import {
  NavLink,
} from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const Header = () => {
  return (
    <div {...stylex.props(styles.header)}>
      <NavLink {...stylex.props(styles.link)} to="/">Home</NavLink>
      <NavLink {...stylex.props(styles.link)} to="/about">About</NavLink>
    </div>
  );
};
