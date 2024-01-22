import * as stylex from '@stylexjs/stylex';

const nightColor = 'rgb(12,9,16)';

export const styles = stylex.create({
  app: {
    minHeight: '100vh',
    background: `linear-gradient(145deg, ${nightColor} 0%, rgba(30,22,40,1) 44%, rgba(15,78,91,1) 100%)`,
    padding: '1rem',
    boxSizing: 'border-box',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: '1rem',
  },
  workletResumer: {
    display: 'none',
  },
  highlighted: {
    color: 'rebeccapurple',
  },
  credits: {
    width: '100%',
    position: 'relative',
    left: 0,
    paddingLeft: '2rem',
    boxSizing: 'border-box',
  },
  a: {
    color: '#F6AE2D',
    ':hover': {
      color: '#B07507',
    },
  },
  social: {
    width: '3rem',
    paddingRight: '1rem',
    filter: 'invert(1)',
  },
  inputDeviceWrapper: {
    minWidth: '340px',
    width: '30vw',
  },
  inputDevice: {
    width: '100%',
  },
  amp: {
    backgroundColor: '#A393BF',
    padding: '2rem 3rem',
    borderRadius: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: 'black',
    border: '1px solid #FFFCFF',
  },
  ampTitle: {
    fontFamily: 'effexor',
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
    margin: '0.5rem 0',
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
    border: `1px solid ${nightColor}`,
    boxShadow: `3px 1px 12px rgb(51, 44, 57)`,
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
    background: nightColor,
  },
  directoryInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directoryHiddenInput: {
    visibility: 'hidden',
    position: 'absolute',
  },
  directoryButton: {
    width: '2rem',
    cursor: 'pointer',
  },
  directoryFileSelect: {
    width: '12rem',
    margin: '0 0.5rem',
  },
});
