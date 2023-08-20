import BetterSelect, { BetterSelectSettings } from './index';
import type jQuery from 'jquery';

declare global {
  interface JQuery<TElement = HTMLElement> {
    betterSelect: (settings?: BetterSelectSettings) => JQuery<TElement>;
  }
}

// register as a jQuery plugin, if jQuery is available
export function registerForJquery() {
  if ('jQuery' in window) {
    (function ($: JQueryStatic) {
      $.fn.betterSelect = function (
        this: JQuery<HTMLSelectElement>,
        settings: BetterSelectSettings = {},
      ) {
        this.each(function () {
          // don't initialize twice
          if (!this.betterSelectInstance) {
            new BetterSelect(this, settings);
          }
        });
        return this;
      };
    })(window.jQuery as JQueryStatic);
  } else {
    console.warn(
      'BetterSelect: jQuery not found. You can still use the BetterSelect class directly.',
    );
  }
}
