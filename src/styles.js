import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(145deg, rgb(12,9,16) 0%, rgba(30,22,40,1) 44%, rgba(15,78,91,1) 100%)',
    padding: '1rem',
    boxSizing: 'border-box',
    color: 'white',
  },
  ampWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  about: {
    maxWidth: '50rem',
    margin: 'auto',
  },
  tuner: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    color: '#d0d7dc',
    marginBottom: '20px',
    lineHeight: 1,
  },
  tunerResult: {
    display: 'flex',
    flexDirection: 'column',
    width: '200px',
    height: '200px',
    borderRadius: '100%',
    backgroundColor: '#353c41',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 10px 13px -7px #000000, 5px 5px 15px 5px rgba(97, 255, 124, 0)',
    color: '#d0d7dc',
  },
  tuned: {
    color: '#61FF7C',
  },
  noteName: {
    fontSize: '60px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  octave: {
    fontSize: '26px',
    fontWeight: '400',
    textTransform: 'uppercase',
  },
  cents: {
    fontSize: '70px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  frequency: {
    marginTop: '20px',
    fontSize: '18px',
    fontWeight: '400',
  },
  rangeBar: {
    width: '250px',
    height: '200px',
    position: 'absolute',
    top: '110px',
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
    transition: 'color 0.2s',
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
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: '0 0.5rem',
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
  knobHeadless: {
    position: 'relative',
    margin: '0.5rem 0',
    width: '3rem',
    height: '3rem',
    outline: 'none',
  },
  knobBaseThumbWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: '16rem',
    background: '#FFFCFF',
    boxShadow: 'inset 0 -3px 1px rgba(0, 0, 0, 0.2), inset 0 3px 1px rgba(255, 255, 255, 0.9), 0px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.05), -1px 2px 2px rgba(0, 0, 0, 0.04737), -2px 3px 2px rgba(0, 0, 0, 0.04474), -3px 4px 2px rgba(0, 0, 0, 0.04211), -4px 5px 2px rgba(0, 0, 0, 0.03947), -5px 6px 2px rgba(0, 0, 0, 0.03684), -6px 7px 2px rgba(0, 0, 0, 0.03421), -7px 8px 2px rgba(0, 0, 0, 0.03158), -8px 9px 2px rgba(0, 0, 0, 0.02895), -9px 10px 2px rgba(0, 0, 0, 0.02632), -10px 11px 2px rgba(0, 0, 0, 0.02368), -11px 12px 2px rgba(0, 0, 0, 0.02105), -12px 13px 2px rgba(0, 0, 0, 0.01842), -13px 14px 2px rgba(0, 0, 0, 0.01579), -14px 15px 2px rgba(0, 0, 0, 0.01316), -15px 16px 2px rgba(0, 0, 0, 0.01053), -16px 17px 2px rgba(0, 0, 0, 0.00789), -17px 18px 2px rgba(0, 0, 0, 0.00526), -18px 19px 2px rgba(0, 0, 0, 0.00263), -19px 20px 2px transparent',
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
  selectedDirectory: {
    textDecoration: 'underline',
  },
  audioMeter: {
    border: '1px solid white',
    display: 'flex',
    height: '100%',
  },
  visualizer: {
    width: '300px',
    margin: 'auto',
  },
  hiddenVisualizer: {
    display: 'none',
  },
  postFxControls: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    padding: '0 0.5rem',
    gap: '1rem',
  },
  controlsCategorySwitch: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    margin: 'auto',
  },
  controlsCategory: {
    background: 'rgb(15,78,91)',
    cursor: 'pointer',
    padding: '0.3rem',
    color: 'white',
    borderRight: '2px solid white',
    transition: 'background 0.4s',
    ':last-child': {
      borderRight: 'none',
    },
    ':hover': {
      background: 'rgb(12,9,16)',
      opacity: 1,
    },
    opacity: 0.5,
  },
  controlsCategoryActive: {
    opacity: 1,
  },
  hide: {
    display: 'none',
  },
});
