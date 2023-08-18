/**
 * A Better Custom Select
 *
 * Developer: Bogdan Barbu (barbu.bogdan.beniamin@gmail.com)
 */

export interface BetterSelectAnchorOption {
  originalOption: HTMLOptionElement;
  value: string;
  label: string;
  element: HTMLAnchorElement;
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
}

export default class BetterSelect {
  #element: HTMLSelectElement;
  #wrapperEl: HTMLElement | null = null;
  #triggerEl: HTMLAnchorElement | null = null;
  #triggerTitleEl: HTMLElement | null = null;
  #dropdownEl: HTMLElement | null = null;
  #dropdownListEl: HTMLUListElement | null = null;
  #preexistingWrapper: boolean = false;

  #skipEmpty: boolean;
  placeholder: string | null;
  #nativeOnMobile: boolean;
  #mobileBreakpoint: number;

  #wrapperClass: string;
  #triggerClass: string;
  #dropdownClass: string;

  #alwaysTriggerChange: boolean = false;
  #fixedPlaceholder: boolean = false;

  #value: string | null = null;
  #title: string | null = null;
  #options: BetterSelectAnchorOption[] = [];
  #opened = false;

  mobileMediaQuery: MediaQueryList | null = null;
  #isMobile = false;

  static zIndex = 100;
  #zIndex: number;
  #originalStyle: string | null = null;

  #selectedOption: BetterSelectAnchorOption | null = null;
  #selectedOptionIndex: number | null = null;
  #searchString: string = '';
  #searchTimeout: number | null = null;

  #mutationObserver: MutationObserver | null = null;

  /**
   * create the custom select
   */
  constructor(
    element: HTMLSelectElement | null,
    {
      skipEmpty = true,
      placeholder = null,
      nativeOnMobile = true,
      mobileBreakpoint = 1024,
      wrapperEl = null,
      wrapperClass = 'better-select',
      triggerClass = 'better-select__trigger',
      dropdownClass = 'better-select__dropdown',
      alwaysTriggerChange = false,
      fixedPlaceholder = false,
      zIndex = undefined,
    }: BetterSelectSettings = {},
  ) {
    // make sure we have a select as an original element
    if (!element || !(element instanceof HTMLSelectElement)) {
      throw new Error(`[BETTER SELECT] Wrong element given. Expected a select!`);
    }

    this.#element = element;
    this.#skipEmpty = skipEmpty;
    this.placeholder = placeholder;
    this.#zIndex = zIndex || (this.constructor as typeof BetterSelect).zIndex--;
    this.#fixedPlaceholder = fixedPlaceholder;

    this.#nativeOnMobile = nativeOnMobile;
    this.#mobileBreakpoint = mobileBreakpoint;
    this.#wrapperClass = wrapperClass;
    this.#triggerClass = triggerClass;
    this.#dropdownClass = dropdownClass;

    if (wrapperEl) {
      this.#wrapperEl = wrapperEl;
      this.#preexistingWrapper = true;
    }

    if (element.dataset.betterSelectInit) {
      return;
    }

    this.#element.dataset.betterSelectInit = 'true';
    this.#element.betterSelectInstance = this;

    this.#alwaysTriggerChange = alwaysTriggerChange;

    this.#initialize();
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
  }

  /**
   * get the values from the original select
   */
  #getValues() {
    this.#value = this.#element.value;
    if ((!this.#value || this.#fixedPlaceholder) && this.placeholder) {
      this.#title = this.placeholder;
    } else {
      const selectedOption = this.#element.options[this.#element.selectedIndex];
      this.#title = selectedOption?.text && selectedOption?.text.length ? selectedOption.text : this.#value;
    }
  }

  /**
   * create the UI elements
   */
  #createUI() {
    // create the trigger
    this.#triggerEl = document.createElement('a');
    this.#triggerEl.style.display = 'block';
    this.#triggerEl.href = '#';
    this.#triggerEl.className = this.#triggerClass;
    this.#triggerTitleEl = document.createElement('span');
    this.#triggerEl.append(this.#triggerTitleEl);

    // create the wrapper
    this.#wrapperEl = this.#wrapperEl || document.createElement('div');
    this.#wrapperEl.classList.add(this.#wrapperClass);
    this.#wrapperEl.style.zIndex = this.#zIndex.toString();
    this.#wrapperEl.tabIndex = 0;
    if (this.#element.name) {
      const wrapperClass = this.#sanitizeClassName(`${this.#wrapperClass}-${this.#element.name}`);
      this.#wrapperEl.classList.add(wrapperClass);
    }
    this.#element.insertAdjacentElement('beforebegin', this.#wrapperEl);

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

    if (this.#nativeOnMobile) {
      this.mobileMediaQuery = window.matchMedia(`(max-width: ${this.#mobileBreakpoint}px)`);
    }

    // initialize the UI values
    this.updateUI();
    window.requestAnimationFrame(() => this.#checkIfMobile());
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
        const element = document.createElement('a');
        element.href = '#';
        element.dataset.value = option.value;
        element.innerHTML = option.text.length ? option.text : option.value;

        const listElement = document.createElement('li');
        if (option.disabled) {
          listElement.classList.add('is-disabled');
        }

        // Allow adding custom styles to the list element using the `data-style` attribute on the option in the original select.
        if (option.dataset.style) {
          listElement.style.cssText += option.dataset.style;
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
    this.#options.forEach(({ listElement }) => {
      list.append(listElement);
    });
    this.#dropdownListEl = list;

    // add the list to the dropdownEl
    dropdownEl.append(list);
    dropdownEl.setAttribute('style', 'position: absolute; left: 0; top: 100%; right: 0;');
    if (this.#dropdownEl) {
      this.#dropdownEl.replaceWith(dropdownEl);
    }
    this.#dropdownEl = dropdownEl;
  }

  /**
   * update UI elements values
   */
  updateUI() {
    this.#getValues();
    this.#element.style.visibility = this.#isMobile ? 'visible' : 'hidden';
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
      return item;
    });

    this.#selectedOption = this.#options.find(option => option.isActive) || null;
    this.#selectedOptionIndex = this.#selectedOption ? this.#options.indexOf(this.#selectedOption) : null;

    this.updateDrowdownSelection();
  }

  updateDrowdownSelection() {
    this.#options.forEach(option => {
      const isReallyActive = option.isActive;
      const isActive = this.#selectedOption === option || isReallyActive;
      option.listElement.classList.toggle('is-active', isActive);
      option.listElement.classList.toggle('is-temporary-selection', isActive && !isReallyActive);
      option.element.classList.toggle('active', isActive);

      if (this.#selectedOption === option) {
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

    this.#mutationObserver?.disconnect();
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
    if (!this.mobileMediaQuery) return;

    this.#isMobile = this.mobileMediaQuery.matches;
    this.#element.style.visibility = this.#isMobile ? 'visible' : 'hidden';
    this.#element.style.zIndex = (this.#isMobile ? 2 : 1).toString();
    if (this.#isMobile) {
      this.close();
    }
  }

  /**
   * toggle the dropdown status
   */
  toggle(newStatus: boolean | null = null) {
    if (newStatus === null) {
      newStatus = !this.#opened;
    }

    // If closing the dropdown, revert the current option to the "natively" selected one.
    if (newStatus === false) {
      this.#setCurrentOption(this.#options.find(option => option.originalOption.selected) || null);
    }

    if (this.#triggerEvent(`betterSelect.${newStatus ? 'open' : 'close'}`)) {
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
    ['change', 'selectActive'].forEach(type =>
      this.#element.addEventListener(type, e => {
        this.updateUI();
      }),
    );

    // open the dropdown on click on the trigger
    this.#triggerEl?.addEventListener('click', e => {
      e.preventDefault();
      this.toggle();
    });

    // close the dropdown when clicking outside the custom select
    document.body.addEventListener('click', e => {
      if (this.#opened && !this.#wrapperEl?.contains(e.target as HTMLElement)) {
        this.close();
      }
    });

    // listen to clicks on dropdown options
    this.#wrapperEl?.addEventListener('click', e => {
      if (!this.#dropdownEl?.contains(e.target as HTMLElement)) {
        return;
      }

      const item = (e.target as HTMLElement).closest('a');
      if (this.#dropdownEl.contains(item)) {
        e.preventDefault();

        const selected = this.#options.find(({ element }) => element == item);
        if (selected?.disabled) {
          return;
        }

        let shouldUpdate = true;
        if (!this.#alwaysTriggerChange) {
          if (selected && selected.value == this.#element.value) {
            shouldUpdate = false;
          } else if (!selected && !this.#element.value) {
            shouldUpdate = false;
          }
        }

        if (shouldUpdate) {
          this.#element.value = selected?.value || '';
          this.#element.dispatchEvent(new CustomEvent('change', { bubbles: true }));
        }
        this.close();
      }
    });

    // listen to media queries, to allow "native on mobile"
    if (this.#nativeOnMobile) {
      this.mobileMediaQuery?.addListener(() => {
        this.#triggerEvent(`betterSelect.mobileBreakpoint`, {
          isMobile: this.mobileMediaQuery?.matches,
        });
        this.#checkIfMobile();
      });
    }

    // Listen to keyboard.
    window.addEventListener('keydown', this.#onKeyDown.bind(this));

    // Listen to changes in the options of the original select.
    this.#mutationObserver = new MutationObserver(() => {
      this.refreshOptions();
    });
    this.#mutationObserver.observe(this.#element, { childList: true });
  }

  #onKeyDown(e: KeyboardEvent) {
    if (e.isComposing || e.keyCode === 229 || e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }

    if (!this.#opened) {
      // If the dropdown is not open, we only care about the trigger.
      if (this.#wrapperEl?.contains(e.target as HTMLElement) && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.toggle();
      }

      // If the dropdown is not open, we don't care about the rest of the keys.
      return;
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
      this.#selectRelative(-10);
      return;
    }

    if (e.key === 'PageDown') {
      this.#selectRelative(10);
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
    console.log('Unhandled key', e.key);
  }

  #select = (option: BetterSelectAnchorOption | null) => {
    this.#selectedOption = option;
    this.#selectedOptionIndex = option ? this.#options.indexOf(option) : -1;
    this.updateDrowdownSelection();
  };

  #selectRelative = (offset: number) => {
    // To do: skip disabled options.
    const currentIndex = this.#selectedOptionIndex || 0;
    const next = this.#options[(currentIndex + offset + this.#options.length) % this.#options.length];
    this.#select(next);
  };

  #selectFirst = () => {
    const first = this.#options[0];
    this.#select(first);
  };

  #selectLast = () => {
    const last = this.#options[this.#options.length - 1];
    this.#select(last);
  };

  #persistCurrentSelection = () => {
    const current = this.#selectedOption;
    if (current && this.#element.value !== current.value) {
      this.#element.value = current.value;
      this.#element.dispatchEvent(new CustomEvent('change', { bubbles: true }));
      this.updateUI();
    }
    this.close();
  };

  #search = (key: string) => {
    this.#searchString += key;
    const search = this.#searchString.toLowerCase();
    const found = this.#options.find(({ label }) => label.toLowerCase().indexOf(search) === 0);
    if (found) {
      this.#select(found);
    }

    // Clear the search string after some time.
    if (this.#searchTimeout) {
      window.clearTimeout(this.#searchTimeout);
    }
    this.#searchTimeout = window.setTimeout(() => {
      this.#searchString = '';
    }, 1500);
  };

  get opened() {
    return this.#opened;
  }

  set opened(newStatus) {
    this.toggle(newStatus);
  }

  get settings() {
    return {
      element: this.#element,
      skipEmpty: this.#skipEmpty,
      placeholder: this.placeholder,
      zIndex: this.#zIndex,

      nativeOnMobile: this.#nativeOnMobile,
      mobileBreakpoint: this.#mobileBreakpoint,
      wrapperClass: this.#wrapperClass,
      triggerClass: this.#triggerClass,
      dropdownClass: this.#dropdownClass,
    };
  }

  updateSettings(settings: Partial<BetterSelectSettings>) {
    // TODO: update the settings
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
}
