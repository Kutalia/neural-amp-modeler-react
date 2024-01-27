import * as stylex from '@stylexjs/stylex';

import { styles } from '../styles';
import { ReactComponent as LinkedIn } from './icons/linkedin.svg';
import { ReactComponent as Discord } from './icons/discord.svg';
import { ReactComponent as Gmail } from './icons/gmail.svg';
import { ReactComponent as Facebook } from './icons/facebook.svg';
import { ReactComponent as YouTube } from './icons/youtube.svg';
import { ReactComponent as GitHub } from './icons/github.svg';

export const Footer = () => {
  const currentYear = (new Date()).getFullYear();

  return (
    <div {...stylex.props(styles.credits)}>
      <h4>Compiled for web by Kote Kutalia &#169; {currentYear}</h4>
      <a
        href="https://www.linkedin.com/in/kote-kutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.socialLink)}
      >
        <LinkedIn {...stylex.props(styles.social)} />
      </a>
      <a
        href="https://github.com/kutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.socialLink)}
      >
        <GitHub {...stylex.props(styles.social)} />
      </a>
      <a
        href="https://discord.gg/mjAsMfMxSQ"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.socialLink)}
      >
        <Discord {...stylex.props(styles.social)} />
      </a>
      <a
        href="mailto:kotekutalia@gmail.com"
        {...stylex.props(styles.socialLink)}
      >
        <Gmail {...stylex.props(styles.social)} />
      </a>
      <a
        href="https://www.facebook.com/people/Neural-Amp-Modeler-Online/61555763290703"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.socialLink)}
      >
        <Facebook {...stylex.props(styles.social)} />
      </a>
      <a
        href="https://www.youtube.com/user/kotekutalia"
        target="_blank"
        rel="noopener noreferrer"
        {...stylex.props(styles.socialLink)}
      >
        <YouTube {...stylex.props(styles.social)} />
      </a>
      <p>
        Original plugin by <a
          href="https://www.neuralampmodeler.com"
          target="_blank"
          rel="noopener noreferrer"
          {...stylex.props(styles.link)}
        >Steven Atkinson</a>
      </p>
    </div>
  );
};
