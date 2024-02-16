import BetterSelect, { BetterSelectSettings, defaultBetterSelectSettings } from './BetterSelect';

export default class BetterSelectComponent extends HTMLElement {
  /**
   * Use the "ElementInternals" API to make the component form-associated.
   */
  static get formAssociated() {
    return true;
  }

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
  wrapperClass: string | undefined = undefined;

  /**
   * The class name of the trigger element.
   * Web component attribute: 'trigger-class'
   */
  triggerClass: string | undefined = undefined;

  /**
   * The class name of the dropdown element.
   * Web component attribute: 'dropdown-class'
   */
  dropdownClass: string | undefined = undefined;

  /**
   * The z-index of the dropdown element.
   * Web component attribute: 'z-index'
   * Default: null
   */
  zIndex: number | null = null;

  /**
   * Whether to scroll the select into view when updating the selection.
   */
  scrollSelectionIntoView: boolean = true;

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
   * The ElementInternals instance.
   */
  internals: ElementInternals | null = null;

  constructor() {
    super();
    this.internals = this.attachInternals?.() || null;
  }

  /**
   * initialize better select when it's inserted ("connected") into the DOM
   */
  connectedCallback(): void {
    this._init();
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

    this._setupInternals();
  }

  /**
   * Setup the ElementInternals instance.
   */
  _setupInternals(): void {
    if (!this.internals || !this._select) return;

    this._updateInternals();
    this.addEventListener('betterSelect.change', () => {
      this._updateInternals();
    });
    ['reset', 'submit'].forEach(event => {
      this.internals?.form?.addEventListener(event, () => {
        this._updateInternals();
      });
    });
  }

  /**
   * Update the ElementInternals instance.
   */
  _updateInternals(): void {
    if (!this.internals || !this._select) return;

    const setFormValue = this.internals.setFormValue.bind(this.internals);
    const setValidity = this.internals.setValidity.bind(this.internals);

    // Set the value of the native select
    setFormValue(this._select?.value || '');

    // Get the validity state from the native select
    const validity: ValidityState = this._select!.validity;
    setValidity(validity, this._select?.validationMessage || '');
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
      scrollSelectionIntoView: this.scrollSelectionIntoView,
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
      'scroll-selection-into-view',
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

    const defaultValues = defaultBetterSelectSettings;

    switch (name) {
      case 'no-skip-empty':
        this.noSkipEmpty = newValue !== null && newValue !== 'false';
        break;
      case 'placeholder':
        this.placeholder = newValue ?? null;
        break;
      case 'fixed-placeholder':
        this.fixedPlaceholder = newValue !== null && newValue !== 'false';
        break;
      case 'no-native-on-mobile':
        this.noNativeOnMobile = newValue !== null && newValue !== 'false';
        break;
      case 'mobile-breakpoint':
        this.mobileBreakpoint = newValue ? parseInt(newValue, 10) : 1024;
        break;
      case 'wrapper-class':
        this.wrapperClass = newValue || defaultValues.wrapperClass;
        break;
      case 'trigger-class':
        this.triggerClass = newValue || defaultValues.triggerClass;
        break;
      case 'dropdown-class':
        this.dropdownClass = newValue || defaultValues.dropdownClass;
        break;
      case 'z-index':
        this.zIndex = newValue ? parseInt(newValue, 10) : null;
        break;
      case 'scroll-selection-into-view':
        this.scrollSelectionIntoView = newValue ? newValue === 'true' : true;
        break;
    }

    if (this.betterSelectInstance) {
      this.betterSelectInstance.settings = this.getSettings();
    }
  }

  disconnectedCallback() {
    if (this.betterSelectInstance) {
      this.betterSelectInstance.destroy();
    }
  }

  get value() {
    return this.betterSelectInstance?.value?.toString() || '';
  }

  set value(value: string) {
    if (this.betterSelectInstance) {
      this.betterSelectInstance.value = value;
    }
  }
}
