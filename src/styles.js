import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  app: {
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#E5ECE9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  highlighted: {
    color: 'rebeccapurple',
  },
});
