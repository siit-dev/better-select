import BetterSelect from './BetterSelect';

// Make sure events are output in the .d.ts declaration file.
import './events';

export default BetterSelect;
export { BetterSelect };
export type { BetterSelectSettings, BetterSelectAnchorOption } from './BetterSelect';
export { defaultBetterSelectSettings } from './BetterSelect';
export { default as BetterSelectComponent } from './WebComponent';
export { registerForJquery } from './registerForJquery';
export { registerWebComponent } from './registerWebComponent';
