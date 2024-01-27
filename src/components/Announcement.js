import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const Announcement = () => {
  return (
    <div>
      <h3>Instructions:</h3>
      <ol>
        <li>Accept the microphone permission request if you want to play guitar</li>
        <li>Upload a NAM profile file (.nam) from your computer or visit <a {...stylex.props(styles.link)} href="https://tonehunt.org">ToneHunt</a> to preload from there</li>
        <li>Press the button below if the profile is not automatically activated</li>
      </ol>
    </div>
  );
};
