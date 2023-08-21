import BetterSelect from './BetterSelect';

declare global {
  interface HTMLSelectElement {
    betterSelectInstance?: BetterSelect;
  }
  interface ElementEventMap {
    'betterSelect.init': CustomEvent<{
      instance: BetterSelect;
    }>;
    'betterSelect.change': CustomEvent<{
      instance: BetterSelect;
      value: string;
      previousValue: string;
    }>;
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
    'betterSelect.destroy': CustomEvent<{
      instance: BetterSelect;
    }>;
  }
}

export default BetterSelect;
export { BetterSelect };
export type { BetterSelectSettings, BetterSelectAnchorOption } from './BetterSelect';
export { defaultBetterSelectSettings } from './BetterSelect';
export { default as BetterSelectComponent } from './WebComponent';
export { registerForJquery } from './registerForJquery';
export { registerWebComponent } from './registerWebComponent';
