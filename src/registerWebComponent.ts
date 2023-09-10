import BetterSelectComponent from './WebComponent';
import './events';

export const registerWebComponent = () => {
  if (!customElements.get('better-select')) {
    customElements.define('better-select', BetterSelectComponent);
  }
};
