import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  app: {
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#0C0910',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  highlighted: {
    color: 'rebeccapurple',
  },
  amp: {
    backgroundColor: '#A393BF',
    padding: '2rem 8rem',
    borderRadius: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: 'black',
    border: '1px solid #FFFCFF',
  },
  ampTitle: {
    fontSize: 'bold',
  },
  ampControls: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
  },
  knobBase: {
    width: '4rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    justifyContent: 'center',
    alignItems: 'center',
    outline: 'none',
  },
  knobHeadleess: {
    position: 'relative',
    width: '4rem',
    height: '4rem',
    outline: 'none',
  },
  knobBaseThumbWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: '16rem',
    background: '#FFFCFF',
  },
  knobBaseThumbWrapper2: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  knobBaseThumb: {
    position: 'absolute',
    left: '50%',
    top: 0,
    height: '50%',
    width: '2px',
    transform: 'translateX(50%)',
    background: 'black',
  }
});
