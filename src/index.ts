import BetterSelect from './BetterSelect';

declare global {
  interface HTMLSelectElement {
    betterSelectInstance?: BetterSelect;
  }
  interface ElementEventMap {
    'betterSelect.open': CustomEvent<{
      instance: BetterSelect;
    }>;
    'betterSelect.close': CustomEvent<{
      instance: BetterSelect;
    }>;
    'betterSelect.mobileBreakpoint': CustomEvent<{
      instance: BetterSelect;
      isMobile: boolean;
    }>;
  }
}

export default BetterSelect;
export { BetterSelect };
export type { BetterSelectSettings, BetterSelectAnchorOption } from './BetterSelect';
export { default as BetterSelectComponent } from './WebComponent';
export { registerForJquery } from './registerForJquery';
export { registerWebComponent } from './registerWebComponent';
