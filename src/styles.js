import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, rgb(12,9,16) 0%, rgba(30,22,40,1) 44%, rgba(15,78,91,1) 100%)',
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
  socialLink: {
    display: 'inline-block',
    paddingRight: '1rem',
  },
  link: {
    color: '#F6AE2D',
    ':hover': {
      color: '#B07507',
    },
  },
  social: {
    width: '3rem',
    height: '3rem',
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
    width: '22rem',
    maxWidth: 'calc(100% - 1rem)',
    backgroundColor: '#A393BF',
    padding: '2rem 0.5rem',
    borderRadius: '2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    color: 'black',
    border: '1px solid #FFFCFF',
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
    border: '1px solid rgb(12,9,16)',
    boxShadow: '3px 1px 12px rgb(51, 44, 57)',
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
    background: 'rgb(12,9,16)',
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
    filter: 'invert(1)',
  },
  directoryButtonDarkMode: {
    filter: 'none',
  },
  directoryFileSelect: {
    cursor: 'pointer',
    width: '14rem',
    margin: '0 0 0 0.5rem',
    backgroundColor: 'white',
    border: 'thin solid bluergb(12,9,16)',
    borderRadius: '4px',
    display: 'inline-block',
    font: 'inherit',
    lineHeight: '1.5rem',
    padding: '0.2rem 3.3rem 0.2rem 0.8rem',
    '-webkit-box-sizing': 'border-box',
    '-moz-box-sizing': 'border-box',
    'box-sizing': 'border-box',
    '-webkit-appearance': 'none',
    '-moz-appearance': 'none',

    backgroundImage:
      `linear-gradient(45deg, transparent 50%, rgb(12,9,16) 50%),
    linear-gradient(135deg, rgb(12,9,16) 50%, transparent 50%),
    linear-gradient(to right, skyblue, skyblue)`,
    backgroundPosition:
      `calc(100% - 1.25rem) calc(1rem - 2px),
    calc(100% - 1.25rem + 8px) calc(1rem - 2px),
    100% 0`,
    backgroundSize:
      `8px 8px,
    8px 8px,
    2.5rem 2.5rem`,
    backgroundRepeat: 'no-repeat',

    ':focus': {
      backgroundImage:
        `linear-gradient(45deg, white 50%, transparent 50%),
    linear-gradient(135deg, transparent 50%, white 50%),
    linear-gradient(to right, gray, gray)`,
      backgroundPosition:
        `calc(100% - 1.25rem + 8px) calc(1rem - 4px),
    calc(100% - 1.25rem) calc(1rem - 4px),
    100% 0`,
      borderColor: 'grey',
      outline: 0,
    }
  },
  directoryFileSelectDarkMode: {
    backgroundColor: 'rgb(12,9,16)',
    color: 'white',
  },
  selectWithoutExpander: {
    backgroundImage: 'none',
    padding: '0.2rem 0.8rem',
  },
  directoryFileSelectDisabled: {
    cursor: 'default',
  },
  fileTreeWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  fileTree: {
    overflow: 'hidden',
    borderRadius: '0.5rem',
    border: '1px solid white',
    width: '600px',
    maxWidth: '100%',
  },
  fileTreeContent: {
    height: '150px',
    overflow: 'auto',
    padding: '0.5rem',
    boxSizing: 'border-box',
  },
  fileTreeLoading: {
    filter: 'grayscale(1)',
  },
});
