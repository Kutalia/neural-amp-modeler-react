import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';

export const Footer = () => {
  const currentYear = (new Date()).getFullYear();

  return (
    <div {...stylex.props(styles.credits)}>
      <h4>Compiled for web by Kote Kutalia &#169; {currentYear}</h4>
      <a
        href="https://www.linkedin.com/in/kote-kutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.a)}
      >
        <img
          src="social_icons/linkedin.svg"
          alt="LinkedIn"
          {...stylex.props(styles.social)}
        />
      </a>
      <a
        href="https://github.com/kutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.a)}
      >
        <img
          src="social_icons/github.svg"
          alt="GitHub"
          {...stylex.props(styles.social)}
        />
      </a>
      <a
        href="mailto:kotekutalia@gmail.com"
        {...stylex.props(styles.a)}
      >
        <img
          src="social_icons/gmail.svg"
          alt="Gmail"
          {...stylex.props(styles.social)}
        />
      </a>
      <a
        href="https://www.facebook.com/kote.kutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.a)}
      >
        <img
          src="social_icons/facebook.svg"
          alt="Facebook"
          {...stylex.props(styles.social)}
        />
      </a>
      <a
        href="https://www.youtube.com/user/kotekutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.a)}
      >
        <img
          src="social_icons/youtube.svg"
          alt="YouTube"
          {...stylex.props(styles.social)}
        />
      </a>
      <p>
        Original plugin by <a
          href="https://www.neuralampmodeler.com"
          target="_blank"
          rel="noopener noreferrer"
          {...stylex.props(styles.a)}
        >Steven Atkinson</a>
      </p>
    </div>
  );
};
