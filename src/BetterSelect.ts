/**
 * A Better Custom Select
 *
 * Developer: Bogdan Barbu (barbu.bogdan.beniamin@gmail.com)
 */

// Make sure events are output in the .d.ts declaration file.
import './events';

export interface BetterSelectAnchorOption {
  originalOption: HTMLOptionElement;
  value: string;
  label: string;
  element: HTMLSpanElement;
  listElement: HTMLLIElement;
  isActive: boolean;
  disabled: boolean;
}

export interface BetterSelectSettings {
  skipEmpty?: boolean;
  placeholder?: string | null;
  nativeOnMobile?: boolean;
  mobileBreakpoint?: number;
  wrapperEl?: HTMLElement | null;
  wrapperClass?: string;
  triggerClass?: string;
  dropdownClass?: string;
  alwaysTriggerChange?: boolean;
  zIndex?: number | null;
  fixedPlaceholder?: boolean;
  scrollSelectionIntoView?: boolean;
}

export const defaultBetterSelectSettings = {
  skipEmpty: true,
  placeholder: null,
  nativeOnMobile: true,
  mobileBreakpoint: 1024,
  wrapperEl: null,
  wrapperClass: 'better-select',
  triggerClass: 'better-select__trigger',
  dropdownClass: 'better-select__dropdown',
  alwaysTriggerChange: false,
  fixedPlaceholder: false,
  zIndex: undefined,
  scrollSelectionIntoView: true,
} satisfies BetterSelectSettings;

export default class BetterSelect {
  #element: HTMLSelectElement;
  #wrapperEl: HTMLElement | null = null;
  #triggerEl: HTMLSpanElement | null = null;
  #triggerTitleEl: HTMLElement | null = null;
  #dropdownEl: HTMLElement | null = null;
  #dropdownListEl: HTMLUListElement | null = null;
  #preexistingWrapper: boolean = false;

  #skipEmpty!: boolean;
  placeholder!: string | null;
  #nativeOnMobile!: boolean;
  #mobileBreakpoint!: number;

  #wrapperClass!: string;
  #triggerClass!: string;
  #dropdownClass!: string;

  #alwaysTriggerChange: boolean = false;
  #fixedPlaceholder: boolean = false;

  #value: string | null = null;
  #title: string | null = null;
  #options: BetterSelectAnchorOption[] = [];
  #opened = false;
  #disabled = false;

  mobileMediaQuery: MediaQueryList | null = null;
  #isMobileAndNative = false;

  static zIndex = 100;
  #zIndex!: number;
  #originalStyle: string | null = null;

  #selectedOption: BetterSelectAnchorOption | null = null;
  #itemHeight: number = 40;
  #selectedOptionIndex: number | null = null;
  #searchString: string = '';
  #searchTimeoutInstance: number | null = null;
  #searchResetTimeout: number = 1500;
  #scrollSelectionIntoView: boolean = true;

  #mutationObserver: MutationObserver | null = null;

  #form: HTMLFormElement | null = null;

  /**
   * create the custom select
   */
  constructor(element: HTMLSelectElement | null, settings: BetterSelectSettings = {}) {
    // make sure we have a select as an original element
    if (!element || !(element instanceof HTMLSelectElement)) {
      throw new Error(`[BETTER SELECT] Wrong element given. Expected a select!`);
    }

    this.#element = element;
    this.#loadSettings(settings);
    this.#disabled = this.#element.disabled;

    if (element.dataset.betterSelectInit) {
      return;
    }

    this.#element.dataset.betterSelectInit = 'true';
    this.#element.betterSelectInstance = this;
    this.#form = this.#element.form || this.#element.closest('form') || null;

    this.#initialize();
  }

  #loadSettings(settings: BetterSelectSettings) {
    // Keep only the settings that are defined.
    settings = Object.fromEntries(
      Object.entries(settings).filter(([, value]) => value !== undefined),
    );

    const {
      skipEmpty,
      placeholder,
      nativeOnMobile,
      mobileBreakpoint,
      wrapperEl,
      wrapperClass,
      triggerClass,
      dropdownClass,
      alwaysTriggerChange,
      fixedPlaceholder,
      zIndex,
      scrollSelectionIntoView = true,
    } = {
      ...defaultBetterSelectSettings,
      ...settings,
    };
    this.#skipEmpty = skipEmpty;
    this.placeholder = placeholder;
    this.#zIndex = zIndex || (this.constructor as typeof BetterSelect).zIndex--;
    this.#fixedPlaceholder = fixedPlaceholder;
    this.#alwaysTriggerChange = alwaysTriggerChange;

    this.#nativeOnMobile = nativeOnMobile;
    this.#mobileBreakpoint = mobileBreakpoint;
    this.#wrapperClass = wrapperClass;
    this.#triggerClass = triggerClass;
    this.#dropdownClass = dropdownClass;
    this.#scrollSelectionIntoView = scrollSelectionIntoView;

    if (wrapperEl) {
      this.#wrapperEl = wrapperEl;
      this.#preexistingWrapper = true;
    }
  }

  // dispatch custom events
  #triggerEvent(eventType: string, detail = {}, target: HTMLElement | null = null) {
    const event = new CustomEvent(eventType, {
      bubbles: true,
      cancelable: true,
      detail: {
        instance: this,
        ...detail,
      },
    });
    return (target || this.#element).dispatchEvent(event);
  }

  #initialize() {
    this.#getValues();
    this.#createUI();
    this.#addListeners();

    this.#triggerEvent(`betterSelect.init`);
  }

  /**
   * get the values from the original select
   */
  #getValues() {
    const previousValue = this.#value;
    this.#value = this.#element.value;

    // Dispatch a change event if the value changed.
    if (previousValue !== this.#value) {
      this.#triggerEvent(`betterSelect.change`, {
        previousValue,
        value: this.#value,
      });
    }

    if ((!this.#value || this.#fixedPlaceholder) && this.placeholder) {
      this.#title = this.placeholder;
    } else {
      const selectedOption = this.#element.options[this.#element.selectedIndex];
      this.#title =
        selectedOption?.text && selectedOption?.text.length ? selectedOption.text : this.#value;
    }
  }

  /**
   * create the UI elements
   */
  #createUI() {
    // create the trigger
    this.#triggerEl = document.createElement('span');
    this.#triggerEl.style.display = 'block';
    this.#triggerEl.tabIndex = 0;
    this.#triggerEl.className = this.#triggerClass;
    this.#triggerTitleEl = document.createElement('span');
    this.#triggerEl.append(this.#triggerTitleEl);

    // create the wrapper
    this.#wrapperEl = this.#wrapperEl || document.createElement('div');
    this.#wrapperEl.classList.add(this.#wrapperClass);
    this.#wrapperEl.classList.add('initializing');
    this.#wrapperEl.classList.toggle('better-select--disabled', this.#disabled);
    this.#wrapperEl.style.zIndex = this.#zIndex.toString();
    if (this.#element.name) {
      const wrapperClass = this.#sanitizeClassName(`${this.#wrapperClass}-${this.#element.name}`);
      this.#wrapperEl.classList.add(wrapperClass);
    }
    if (!this.#wrapperEl.contains(this.#element)) {
      this.#element.insertAdjacentElement('beforebegin', this.#wrapperEl);
    }

    // add elements inside the wrapperEl
    this.#createDropdown();

    this.#wrapperEl.append(this.#element);
    this.#wrapperEl.append(this.#triggerEl);
    this.#wrapperEl.append(this.#dropdownEl!);
    this.#wrapperEl.style.position = 'relative';
    this.#originalStyle = this.#originalStyle || this.#element.style.cssText;
    window.requestAnimationFrame(() => {
      this.#element.style.cssText += `; opacity: 0; position: absolute; left: 0; right: 0; top: 0; height: ${
        this.#triggerEl?.offsetHeight || 20
      }px; z-index: ${this.#zIndex}; width: 100%;`;
    });

    this.mobileMediaQuery = window.matchMedia(`(max-width: ${this.#mobileBreakpoint}px)`);

    // initialize the UI values
    this.updateUI();
    window.requestAnimationFrame(() => {
      this.#checkIfMobile();
      this.#wrapperEl?.classList.remove('initializing');
    });
  }

  #sanitizeClassName(className: string): string {
    return className.replace(/[^a-z0-9_-]/gi, '-');
  }

  /**
   * create the dropdownEl
   */
  #createDropdown() {
    const dropdownEl = document.createElement('div');
    dropdownEl.className = this.#dropdownClass;
    dropdownEl.style.width = `${this.#element.offsetWidth}px`;

    const options = [...this.#element.options]
      .map(option => {
        const value = option.value;

        // disable and skip empty options
        if (this.#skipEmpty && !value.length) {
          option.disabled = true;
          return null;
        }

        // create the dropdownEl element
        const element = document.createElement('span');
        element.dataset.value = option.value;
        element.innerHTML = option.text.length ? option.text : option.value;

        const listElement = document.createElement('li');
        if (option.disabled) {
          listElement.classList.add('is-disabled');
        }

        // Allow adding custom styles to the list element using the `data-style` attribute on the option in the original select.
        if (option.dataset.style) {
          listElement.style.cssText += option.dataset.style;
          listElement.dataset.style = option.dataset.style;
        }
        listElement.append(element);

        return {
          originalOption: option,
          label: option.text,
          value,
          element,
          listElement,
          disabled: option.disabled,
          isActive: option.value === this.#value,
        };
      })
      .filter(Boolean);
    this.#options = options as BetterSelectAnchorOption[];

    // create the list
    const list = document.createElement('ul');
    list.classList.add('better-select__dropdown-list');
    list.tabIndex = -1;
    this.#options.forEach(({ listElement }) => {
      list.append(listElement);
    });
    this.#dropdownListEl = list;

    // add the list to the dropdownEl
    dropdownEl.append(list);
    dropdownEl.style.position = "absolute";
    dropdownEl.style.left = "0";
    dropdownEl.style.top = "100%";
    dropdownEl.style.right = "0";
    if (this.#dropdownEl) {
      this.#dropdownEl.replaceWith(dropdownEl);
    }
    this.#dropdownEl = dropdownEl;

    // Update the item height
    this.#itemHeight = this.#dropdownListEl?.querySelector('li')?.offsetHeight || this.#itemHeight;
  }

  /**
   * update UI elements values
   */
  updateUI() {
    this.#disabled = this.element.disabled;
    this.#getValues();
    this.#element.style.visibility = this.#isMobileAndNative ? 'visible' : 'hidden';
    if (this.#triggerTitleEl) {
      this.#triggerTitleEl.innerHTML = this.#title || '';
    }
    this.#triggerEl?.classList.toggle('has-selected', !!this.#value);
    this.#wrapperEl?.classList.toggle('has-selected', !!this.#value);
    if (this.#triggerEl) {
      this.#triggerEl.dataset.hasSelectedIndex = this.#element.selectedIndex.toString();
    }

    this.#options = this.#options.map(item => {
      item.isActive = item.originalOption.value === this.#value;
      item.disabled = item.originalOption.disabled;
      return item;
    });

    this.#selectedOption = this.#options.find(option => option.isActive) || null;
    this.#selectedOptionIndex = this.#selectedOption
      ? this.#options.indexOf(this.#selectedOption)
      : null;

    if (this.#triggerEl) {
      this.#triggerEl.style.cssText = this.#selectedOption?.listElement.dataset.style || '';
    }

    this.updateDrowdownSelection();

    // Update disabled/enabled settings
    this.#wrapperEl?.classList.toggle('better-select--disabled', this.#disabled);
    this.#triggerEl?.classList.toggle('disabled', this.#disabled);
    if (this.#triggerEl) {
      if (this.#disabled) {
        this.#triggerEl.removeAttribute('tabindex');
        this.#triggerEl.setAttribute('aria-disabled', 'true');
      } else {
        this.#triggerEl.tabIndex = 0;
        this.#triggerEl.removeAttribute('aria-disabled');
      }
    }
    if (this.#dropdownEl) {
      if (this.#disabled) {
        this.#dropdownEl.setAttribute('aria-disabled', 'true');
      } else {
        this.#dropdownEl.removeAttribute('aria-disabled');
      }
    }

    this.#triggerEvent(`betterSelect.updatedUI`);
  }

  updateDrowdownSelection() {
    this.#options.forEach(option => {
      const isReallyActive = option.isActive;
      const isActive = this.#selectedOption === option || isReallyActive;
      option.listElement.classList.toggle('is-active', isActive);
      option.listElement.classList.toggle('is-temporary-selection', isActive && !isReallyActive);
      option.element.classList.toggle('active', isActive);

      if (
        this.#dropdownListEl &&
        this.#scrollSelectionIntoView &&
        this.#selectedOption === option &&
        this.opened &&
        this.#dropdownListEl.scrollHeight > this.#dropdownListEl.clientHeight
      ) {
        option.listElement.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  #setCurrentOption(option: BetterSelectAnchorOption | null) {
    this.#selectedOption = option;
    this.#selectedOptionIndex = option ? this.#options.indexOf(option) : null;
    this.updateDrowdownSelection();
  }

  /**
   * destroy the custom select and put back the original element
   */
  destroy() {
    this.#triggerEvent(`betterSelect.destroy`);
    this.#removeListeners();

    this.#element.style.cssText = this.#originalStyle || '';
    delete this.#element.betterSelectInstance;
    delete this.#element.dataset.betterSelectInit;
    if (!this.#preexistingWrapper) {
      this.#wrapperEl?.replaceWith(this.#element);
    } else if (this.#wrapperEl) {
      this.#wrapperEl.classList.remove(this.#wrapperClass, 'has-selected');
      this.#wrapperEl.style.zIndex = '';
      this.#wrapperEl.style.position = '';
      this.#wrapperEl.tabIndex = -1;
    }
  }

  /**
   * reinitialize the custom select
   */
  reInit() {
    const raf = window.requestAnimationFrame;
    raf(() => {
      this.destroy();
      raf(() => this.#initialize());
    });
  }

  /**
   * refresh the options in the dropdown
   */
  refreshOptions() {
    this.#createDropdown();
    this.updateUI();
  }

  #checkIfMobile() {
    this.#isMobileAndNative = (this.mobileMediaQuery?.matches || false) && this.#nativeOnMobile;
    this.#element.style.visibility = this.#isMobileAndNative ? 'visible' : 'hidden';
    this.#element.style.zIndex = (this.#isMobileAndNative ? 2 : 1).toString();
    if (this.#isMobileAndNative) {
      this.close();
    }
  }

  isMobileAndNative() {
    return this.#isMobileAndNative;
  }

  /**
   * toggle the dropdown status
   */
  toggle(newStatus: boolean | null = null) {
    if (this.#disabled && newStatus !== false) {
      return;
    }

    // If the dropdown is open and we're on mobile, close it.
    if (this.#isMobileAndNative) {
      newStatus = false;
    }

    if (newStatus === null) {
      newStatus = !this.#opened;
    }

    // If closing the dropdown, revert the current option to the "natively" selected one.
    if (newStatus === false) {
      this.#setCurrentOption(this.#options.find(option => option.originalOption.selected) || null);
    }

    if (
      this.#isMobileAndNative ||
      this.#triggerEvent(`betterSelect.${newStatus ? 'open' : 'close'}`)
    ) {
      this.#wrapperEl?.parentElement?.classList.toggle('has-open-better-select', newStatus);
      this.#wrapperEl?.classList.toggle('open', newStatus);
      this.#dropdownEl?.classList.toggle('open', newStatus);
      this.#opened = newStatus;
      if (this.#opened) {
        this.#element.focus();
      }
    }
  }

  /**
   * close the dropdown
   */
  close() {
    this.toggle(false);
  }

  /**
   * listen to events
   */
  #addListeners() {
    // listen to the changes to the original select
    ['change', 'selectActive', 'input', 'betterSelect.updateUI'].forEach(type =>
      this.#element.addEventListener(type, this.updateUI.bind(this)),
    );

    // Switch focus to the trigger when focusing the custom select.
    this.#element.addEventListener('focus', this.#onNativeSelectFocus.bind(this));

    document.addEventListener('focus', this.#onDocumentFocus.bind(this), true);

    // open the dropdown on click on the trigger
    this.#triggerEl?.addEventListener('click', this.#onTriggerClick.bind(this));

    // close the dropdown when clicking outside the custom select
    document.body.addEventListener('click', this.#onOutsideClick.bind(this));

    // listen to clicks on dropdown options
    this.#wrapperEl?.addEventListener('click', this.#onWrapperClick.bind(this));

    // listen to media queries, to allow "native on mobile"
    this.mobileMediaQuery?.addListener(this.#onMobileMediaQueryChange.bind(this));

    // Listen to keyboard.
    window.addEventListener('keydown', this.#onKeyDown.bind(this));

    // Listen to changes in the options of the original select.
    this.#mutationObserver = new MutationObserver(() => {
      this.refreshOptions();
    });
    this.#mutationObserver.observe(this.#element, {
      childList: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });

    // Listen to the "reset" event on the form, if any.
    this.#form?.addEventListener('reset', this.#onFormReset.bind(this));
  }

  #removeListeners() {
    ['change', 'selectActive', 'input'].forEach(type =>
      this.#element.removeEventListener(type, this.updateUI.bind(this)),
    );

    this.#element.removeEventListener('focus', this.#onNativeSelectFocus.bind(this));

    document.removeEventListener('focus', this.#onDocumentFocus.bind(this), true);

    this.#triggerEl?.removeEventListener('click', this.#onTriggerClick.bind(this));
    document.body.removeEventListener('click', this.#onOutsideClick.bind(this));
    this.#wrapperEl?.removeEventListener('click', this.#onWrapperClick.bind(this));

    this.mobileMediaQuery?.removeListener(this.#onMobileMediaQueryChange.bind(this));

    window.removeEventListener('keydown', this.#onKeyDown.bind(this));
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;

    this.#form?.removeEventListener('reset', this.#onFormReset.bind(this));
  }

  #onTriggerClick(e: MouseEvent) {
    e.preventDefault();
    this.toggle();
  }

  #onWrapperClick(e: MouseEvent) {
    if (!this.#dropdownEl?.contains(e.target as HTMLElement)) {
      return;
    }

    if (this.#disabled) {
      return;
    }

    const item = (e.target as HTMLElement).closest('span');
    if (this.#dropdownEl.contains(item)) {
      e.preventDefault();

      const selected = this.#options.find(({ element }) => element === item);
      if (selected?.disabled) {
        return;
      }

      let shouldUpdate = true;
      if (!this.#alwaysTriggerChange) {
        if (selected && selected.value === this.#element.value) {
          shouldUpdate = false;
        } else if (!selected && !this.#element.value) {
          shouldUpdate = false;
        }
      }

      if (shouldUpdate) {
        this.value = selected?.value || '';
      }
      this.close();
    }
  }

  #onOutsideClick(e: MouseEvent) {
    if (this.#opened && !this.#wrapperEl?.contains(e.target as HTMLElement)) {
      this.close();
    }
  }

  #onNativeSelectFocus() {
    if (!this.#isMobileAndNative) {
      this.#triggerEl?.focus();
    }
  }

  #onDocumentFocus(e: FocusEvent) {
    // Close the dropdown if the focus is outside the custom select.
    if (!this.#wrapperEl?.contains(e.target as HTMLElement)) {
      this.close();
    }
  }

  #onMobileMediaQueryChange() {
    this.#triggerEvent(`betterSelect.mobileBreakpoint`, {
      isMobile: this.mobileMediaQuery?.matches,
    });
    this.#checkIfMobile();
  }

  async #onFormReset() {
    // Wait for the form to reset - the reset event is dispatched before the form is actually reset.
    await new Promise(resolve => setTimeout(resolve, 0));
    this.updateUI();
  }

  #isFocused(e: KeyboardEvent) {
    return (
      this.#wrapperEl?.contains(document.activeElement) ||
      this.#wrapperEl?.contains(e.target as HTMLElement)
    );
  }

  #onKeyDown(e: KeyboardEvent) {
    if (!this.#isFocused(e)) {
      return;
    }

    if (
      e.isComposing ||
      e.keyCode === 229 ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.key === 'Tab'
    ) {
      return;
    }

    // Open the dropdown on Space or Enter.
    if (!this.#opened) {
      if (
        this.#wrapperEl?.contains(e.target as HTMLElement) &&
        (e.key === 'Enter' || e.key === ' ')
      ) {
        e.preventDefault();
        this.toggle();
        return;
      }
    }

    e.preventDefault();

    if (e.key === 'Escape' || e.key === 'Tab') {
      this.close();
      return;
    }

    if (e.key === 'ArrowDown') {
      this.#selectRelative(1);
      return;
    }

    if (e.key === 'ArrowUp') {
      this.#selectRelative(-1);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      this.#persistCurrentSelection();
      return;
    }

    if (e.key === 'Home') {
      this.#selectFirst();
      return;
    }

    if (e.key === 'End') {
      this.#selectLast();
      return;
    }

    if (e.key === 'PageUp') {
      this.#selectRelative(this.#getPageSize() * -1);
      return;
    }

    if (e.key === 'PageDown') {
      this.#selectRelative(this.#getPageSize());
      return;
    }

    // Search options.
    if (e.key.match(/^[a-zA-Z0-9]$/)) {
      this.#search(e.key);
      return;
    }

    if (e.key === 'Backspace') {
      this.#searchString = this.#searchString.slice(0, -1);
      return;
    }

    // Do nothing for other keys.
  }

  #findNextEnabledOption = (
    option: BetterSelectAnchorOption | null,
    reverse: boolean = false,
  ): BetterSelectAnchorOption | null => {
    if (!option) {
      return null;
    }

    if (!option.disabled) {
      return option;
    }

    // Is there any enabled option??
    if (this.#options.every(opt => opt.disabled)) {
      return null;
    }

    // Skip disabled options.
    const currentIndex = this.#options.indexOf(option);
    let next: BetterSelectAnchorOption;
    let index = currentIndex;
    do {
      index += reverse ? -1 : 1;

      if (index >= this.#options.length) {
        index = this.#options.length - 1;
        reverse = true;
      } else if (index < 0) {
        index = 0;
        reverse = false;
      }

      next = this.#options[index];
    } while (next.disabled);

    return next;
  };

  #select = (option: BetterSelectAnchorOption | null) => {
    option = this.#findNextEnabledOption(option);

    // If the dropdown is not open, simply update the value.
    if (!this.#opened) {
      this.value = option?.value || '';
      return;
    }

    this.#selectedOption = option;
    this.#selectedOptionIndex = option ? this.#options.indexOf(option) : -1;
    this.updateDrowdownSelection();
  };

  #selectRelative = (offset: number) => {
    const currentIndex = this.#selectedOptionIndex ?? (offset > 0 ? -1 : 0);
    const nextIndex = Math.max(Math.min(offset + currentIndex, this.#options.length - 1), 0);
    const next = this.#options[nextIndex];
    this.#select(this.#findNextEnabledOption(next, offset < 0));
  };

  #selectFirst = () => {
    const first = this.#options[0];
    this.#select(first);
  };

  #selectLast = () => {
    const last = this.#options[this.#options.length - 1];
    this.#select(this.#findNextEnabledOption(last, true));
  };

  #persistCurrentSelection = () => {
    const current = this.#selectedOption;
    if (current && this.#element.value !== current.value) {
      this.value = current.value;
      this.updateUI();
    }
    this.close();
  };

  /**
   * Get the number of items that fit in the dropdown.
   */
  #getPageSize = (): number => {
    const calculated = Math.floor(this.#dropdownEl?.offsetHeight || 300 / this.#itemHeight);
    return Math.max(calculated, 1);
  };

  #search = (key: string) => {
    this.#searchString += key;
    const search = this.#searchString.toLowerCase();
    const found = this.#options.find(
      ({ label, disabled }) => label.toLowerCase().indexOf(search) === 0 && !disabled,
    );
    if (found) {
      this.#select(found);
    }

    // Clear the search string after some time.
    if (this.#searchTimeoutInstance) {
      window.clearTimeout(this.#searchTimeoutInstance);
    }
    this.#searchTimeoutInstance = window.setTimeout(() => {
      this.#searchString = '';
    }, this.#searchResetTimeout);
  };

  get opened() {
    return this.#opened;
  }

  set opened(newStatus) {
    this.toggle(newStatus);
  }

  get settings(): BetterSelectSettings {
    return {
      skipEmpty: this.#skipEmpty,
      placeholder: this.placeholder,
      fixedPlaceholder: this.#fixedPlaceholder,
      nativeOnMobile: this.#nativeOnMobile,
      mobileBreakpoint: this.#mobileBreakpoint,
      zIndex: this.#zIndex,

      wrapperClass: this.#wrapperClass,
      triggerClass: this.#triggerClass,
      dropdownClass: this.#dropdownClass,
      alwaysTriggerChange: this.#alwaysTriggerChange,
      scrollSelectionIntoView: this.#scrollSelectionIntoView,
    };
  }

  set settings(settings: BetterSelectSettings) {
    this.updateSettings(settings);
  }

  updateSettings(settings: Partial<BetterSelectSettings>) {
    const updatedSettings = {
      ...this.settings,
      ...settings,
    };
    this.#loadSettings(updatedSettings);
    this.reInit();
  }

  get wrapperEl() {
    return this.#wrapperEl;
  }

  get triggerEl() {
    return this.#triggerEl;
  }

  get dropdownEl() {
    return this.#dropdownEl;
  }

  get select() {
    return this.#element;
  }

  get element() {
    return this.#element;
  }

  get value() {
    return this.#value;
  }

  set value(value: string | number | null) {
    this.#element.value = value?.toString() || '';
    this.#element.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }
}
