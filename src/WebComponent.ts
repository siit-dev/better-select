import BetterSelect, { BetterSelectSettings } from './BetterSelect';

export default class BetterSelectComponent extends HTMLElement {
  /**
   * Don't skip empty options.
   * Web component attribute: 'no-skip-empty'
   */
  noSkipEmpty: boolean = false;

  /**
   * The placeholder text.
   * Web component attribute: 'placeholder'
   */
  placeholder: string | null = null;

  /**
   * Always display the placeholder, even if values are selected.
   * Web component attribute: 'fixed-placeholder'
   */
  fixedPlaceholder: boolean = false;

  /**
   * Don't use the native select on mobile devices.
   * Web component attribute: 'no-native-on-mobile'
   */
  noNativeOnMobile: boolean = false;

  /**
   * The mobile breakpoint in px.
   */
  mobileBreakpoint: number = 1024;

  /**
   * The class name of the wrapper element.
   * Web component attribute: 'wrapper-class'
   */
  wrapperClass: string = 'better-select';

  /**
   * The class name of the trigger element.
   * Web component attribute: 'trigger-class'
   */
  triggerClass: string = 'better-select__trigger';

  /**
   * The class name of the dropdown element.
   * Web component attribute: 'dropdown-class'
   */
  dropdownClass: string = 'better-select__dropdown';

  /**
   * The z-index of the dropdown element.
   * Web component attribute: 'z-index'
   * Default: null
   */
  zIndex: number | null = null;

  /**
   * The native select element.
   * @private
   */
  _select: HTMLSelectElement | null = null;

  /**
   * The BetterSelect instance.
   */
  betterSelectInstance: BetterSelect | null = null;

  /**
   * The connected state.
   */
  _connected: boolean = false;

  /**
   * initialize better select when it's inserted ("connected") into the DOM
   */
  connectedCallback(): void {
    // don't initialize twice, if the component is moved in the DOM into another DOM element
    if (!this._connected) {
      this._connected = true;
      this._init();
    }
  }

  update() {
    this._init();
  }

  _init(): void {
    this._select = this.querySelector('select');
    if (!this._select) return;

    if ('betterSelectInstance' in this._select) {
      const instance = (this._select as any).betterSelectInstance as BetterSelect;
      instance.destroy();
    }

    this.betterSelectInstance = new BetterSelect(this._select, this.getSettings());
  }

  get betterSelect() {
    return this.betterSelectInstance;
  }

  getSettings(): BetterSelectSettings {
    return {
      skipEmpty: !this.noSkipEmpty,
      placeholder: this.placeholder,
      fixedPlaceholder: this.fixedPlaceholder,
      nativeOnMobile: !this.noNativeOnMobile,
      mobileBreakpoint: this.mobileBreakpoint,
      wrapperClass: this.wrapperClass,
      triggerClass: this.triggerClass,
      dropdownClass: this.dropdownClass,
      zIndex: this.zIndex,
    };
  }

  /**
   * Listen for changes in the attributes.
   */
  static get observedAttributes(): string[] {
    return [
      'no-skip-empty',
      'placeholder',
      'fixed-placeholder',
      'no-native-on-mobile',
      'mobile-breakpoint',
      'wrapper-class',
      'trigger-class',
      'dropdown-class',
      'z-index',
    ];
  }

  /**
   * Update the settings when an attribute changes.
   * @private
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null | undefined,
    newValue: string | null | undefined,
  ): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'no-skip-empty':
        this.noSkipEmpty = newValue !== null;
        break;
      case 'placeholder':
        this.placeholder = newValue || null;
        break;
      case 'fixed-placeholder':
        this.fixedPlaceholder = newValue !== null;
        break;
      case 'no-native-on-mobile':
        this.noNativeOnMobile = newValue !== null;
        break;
      case 'mobile-breakpoint':
        this.mobileBreakpoint = newValue ? parseInt(newValue) : 1024;
        break;
      case 'wrapper-class':
        this.wrapperClass = newValue || 'better-select';
        break;
      case 'trigger-class':
        this.triggerClass = newValue || 'better-select__trigger';
        break;
      case 'dropdown-class':
        this.dropdownClass = newValue || 'better-select__dropdown';
        break;
      case 'z-index':
        this.zIndex = newValue ? parseInt(newValue) : null;
        break;
    }
  }

  disconnectedCallback() {
    if (this.betterSelectInstance) {
      this.betterSelectInstance.destroy();
    }
  }
}
