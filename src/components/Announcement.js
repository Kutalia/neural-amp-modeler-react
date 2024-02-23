import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const Announcement = () => {
  return (
    <div>
      <ol>
        <li>Accept the microphone permission request if you want to play your guitar</li>
        <li>Upload a NAM profile file (.nam) from your computer or visit <a {...stylex.props(styles.link)} href="https://tonehunt.org">ToneHunt</a> to preload from there</li>
        <li>Press the button below if the profile is not automatically activated</li>
        <li>Currently resampling is disabled, please set 48KHz sample rate in your interface and load appropriate profiles and IRs</li>
        <li>Using&nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.mozilla.org/en-US/firefox/new"
            {...stylex.props(styles.link)}
          >
            Mozilla Firefox
          </a>
          &nbsp;is recommended
        </li>
        <li>Click on the download icon at the end of your searchbar to&nbsp;
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://en.wikipedia.org/wiki/Progressive_web_app"
            {...stylex.props(styles.link)}
          >
            install the website
          </a>
          &nbsp;for offline use ➚</li>
      </ol>
    </div>
  );
};
