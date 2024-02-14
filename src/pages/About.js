import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const About = () => {
  return (
    <div {...stylex.props(styles.about)}>
      <h1>About NAM Online</h1>
      <ul>
        <li>NAM is an online platform for running high quality AI-trained guitar amplifiers, cabinets and effects simulations directly in your browser</li>
        <li>It's powered by a web port of the&nbsp;
          <a
            {...stylex.props(styles.link)}
            href="https://www.neuralampmodeler.com"
            target="_blank"
            rel="noopener noreferrer"
          >Neural Amp Modeler</a>&nbsp;
          plugin
        </li>
        <li>The website supports uploading custom impulse responses for guitar cabinet simulation, post-effects like reverb</li>
        <li>You can either play these effects in realtime with your connected instrument or test a sound using prerecorded tracks</li>
        <li>You are able to visit&nbsp;
          <a
            {...stylex.props(styles.link)}
            href="https://www.tonehunt.org"
            target="_blank"
            rel="noopener noreferrer"
          >ToneHunt.org</a>
          , select your desired amp profile and redirect here by clicking <i>"Try with NAM Online"</i>.
          <br />
          The profile will be safely cached in the browser and stay on your hard disk even after you close the window.
          <br />
          Cached profiles will be retrievable through a file tree after you reopen the website from the same browser
        </li>
        <li>The website uses state of the art web technologies behind the scenes.&nbsp;
          There are some compatibility issues for browsers like FireFox on Android, Safari on iOS and etc.</li>
        <li>There is a noticeable latency when playing on older systems, especially those running on Windows.&nbsp;
          This is due to how Web Audio internally works, because of it's limitations there's hardly anything I can do to improve latency</li>
        <li>If you encounter more issues please contact me on social links posted below</li>
      </ul>
    </div>
  );
};
