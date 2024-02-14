import * as stylex from '@stylexjs/stylex';

import { styles } from './styles';
import { Amp } from './pages/Amp';
import { Header } from './components/Header';
import { Outlet, useLocation } from 'react-router-dom';

export const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div {...stylex.props(styles.app)}>
      <Header />
      <Outlet />
      <div {...stylex.props(pathname !== '/' && styles.hide)}>
        <Amp />
      </div>
    </div>
  );
};
