'use strict';

import { beforeAll, beforeEach, it, expect, jest } from '@jest/globals';
import '../__mocks__/stubs.mock';

import BetterSelect from '../src/index';
let betterSelect: HTMLDivElement | null = null,
  select: HTMLSelectElement | null = null,
  betterSelectInstance: BetterSelect | null = null;

const selectOption = (value: string | number) => {
  betterSelect
    ?.querySelector<HTMLAnchorElement>(`.better-select__dropdown-list a[data-value="${value}"]`)
    ?.click();
};
const getSelectedOption = (): HTMLLIElement | null => {
  return (
    betterSelect?.querySelector<HTMLLIElement>(`.better-select__dropdown-list li.is-active`) || null
  );
};

const getSelectedOptionValue = (): string | null => {
  return getSelectedOption()?.querySelector('a')?.dataset.value || null;
};
const getTemporarilySelectedOption = (): HTMLLIElement | null => {
  return (
    betterSelect?.querySelector<HTMLLIElement>(
      `.better-select__dropdown-list li.is-temporary-selection`,
    ) || null
  );
};
const getTemporarilySelectedOptionValue = (): string | null => {
  return getTemporarilySelectedOption()?.querySelector('a')?.dataset.value || null;
};
const getValue = (): string | null => {
  if (betterSelectInstance?.opened) {
    return getTemporarilySelectedOptionValue() || getSelectedOptionValue();
  }
  return getSelectedOptionValue();
};
const getTrigger = (): HTMLElement | null => {
  return betterSelect?.querySelector<HTMLElement>(`.better-select__trigger`) || null;
};
const getDropdownList = (): HTMLElement | null => {
  return betterSelect?.querySelector(`.better-select__dropdown-list`) || null;
};
const pressKey = (key: string, extraOptions: Partial<KeyboardEventInit> = {}) => {
  getDropdownList()?.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...extraOptions }),
  );
};
const pressTriggerKey = (key: string, extraOptions: Partial<KeyboardEventInit> = {}) => {
  getTrigger()?.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...extraOptions }),
  );
};

beforeAll(() => {
  const { registerWebComponent } = require('../src/index');
  registerWebComponent();
});

beforeEach(() => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1" disabled>Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" >Option 3</option>
      <option value="4" disabled>Option 4</option>
      <option value="5" selected>Option 5</option>
      <option value="6">Option 6</option>
      <option value="7">Option 7</option>
      <option value="8" disabled>Option 8</option>
      <option value="9">Option 9</option>
      <option value="10" disabled>Option 10</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select?.closest('.better-select') || null;
});

it("doesn't go to the next or previous option when pressing the down or up arrow with Ctrl or Alt or Meta", () => {
  betterSelectInstance!.toggle(true);
  pressKey('ArrowDown', { ctrlKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();

  pressKey('ArrowDown', { altKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();

  pressKey('ArrowDown', { metaKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();

  pressKey('ArrowUp', { ctrlKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();

  pressKey('ArrowUp', { altKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();

  pressKey('ArrowUp', { metaKey: true });
  expect(getTemporarilySelectedOptionValue()).toBeNull();
});

it.each([{ isOpen: true }, { isOpen: false }])(
  'goes to the next option when pressing the down arrow (dropdown open: $isOpen)',
  ({ isOpen }) => {
    betterSelectInstance!.toggle(true);
    selectOption('2');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('ArrowDown');
    expect(getValue()).toBe('3');

    pressKey('ArrowDown');
    expect(getValue()).toBe('5');

    // Don't rewind to the first option
    selectOption('9');
    expect(getValue()).toBe('9');
    betterSelectInstance!.toggle(isOpen);
    pressKey('ArrowDown');
    expect(getValue()).toBe('9');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  'goes to the previous option when pressing the up arrow (dropdown open: $isOpen)',
  ({ isOpen }) => {
    betterSelectInstance!.toggle(true);
    selectOption('1');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }
    pressKey('ArrowUp');
    expect(getValue()).toBe('3');

    betterSelectInstance!.value = '7';
    betterSelectInstance!.toggle(isOpen);
    pressKey('ArrowUp');
    expect(getValue()).toBe('6');

    // Don't rewind to the last option
    selectOption('2');
    betterSelectInstance!.toggle(isOpen);
    pressKey('ArrowUp');
    expect(getValue()).toBe('2');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  'goes to the first enabled option when pressing the home key (dropdown open: $isOpen)',
  ({ isOpen }) => {
    betterSelectInstance!.toggle(true);
    selectOption('7');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('Home');
    expect(getValue()).toBe('2');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  'goes to the last option when pressing the end key (dropdown open: $isOpen)',
  ({ isOpen }) => {
    betterSelectInstance!.toggle(true);
    selectOption('2');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('End');
    expect(getValue()).toBe('9');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  'listens to page up and page down keys (dropdown open: $isOpen)',
  ({ isOpen }) => {
    betterSelectInstance!.toggle(true);
    selectOption('2');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('PageDown');
    expect(getValue()).not.toBe('2');

    selectOption('9');
    betterSelectInstance!.toggle(isOpen);
    pressKey('PageUp');
    expect(getValue()).not.toBe('9');
  },
);

it('selects the temporarily selected option when pressing the enter key', () => {
  betterSelectInstance!.toggle(true);
  selectOption('2');
  betterSelectInstance!.toggle(true);

  expect(getSelectedOptionValue()).toBe('2');
  pressKey('ArrowDown');
  pressKey('ArrowDown');
  expect(getTemporarilySelectedOptionValue()).toBe('5');
  pressKey('Enter');
  expect(getSelectedOptionValue()).toBe('5');
});

it("doesn't select disabled options", () => {
  betterSelectInstance!.toggle(true);
  selectOption('3');
  betterSelectInstance!.toggle(true);
  expect(getSelectedOptionValue()).toBe('3');

  pressKey('ArrowDown');
  expect(getTemporarilySelectedOptionValue()).not.toBe('4');

  pressKey('Enter');
  expect(getSelectedOptionValue()).not.toBe('4');

  betterSelectInstance!.toggle(true);
  selectOption('5');
  betterSelectInstance!.toggle(true);
  expect(getSelectedOptionValue()).toBe('5');

  pressKey('ArrowUp');
  expect(getTemporarilySelectedOptionValue()).not.toBe('4');

  pressKey('Enter');
  expect(getSelectedOptionValue()).not.toBe('4');
});

it('closes the dropdown when pressing the escape key', () => {
  betterSelectInstance!.opened = true;
  expect(betterSelectInstance!.opened).toBe(true);
  pressKey('Escape');
  expect(betterSelectInstance!.opened).toBe(false);
});

it.each([{ isOpen: true }, { isOpen: false }])(
  'searches for options when typing (dropdown open: $isOpen)',
  ({ isOpen }) => {
    document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Third</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
      <option value="6">Sixth option</option>
      <option value="7">Seventh option</option>
    </select>
  `;

    select = document.querySelector('#select1');
    betterSelectInstance = new BetterSelect(select);
    betterSelect = select?.closest('.better-select') || null;

    betterSelectInstance!.toggle(true);
    selectOption('1');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('s');
    expect(getValue()).toBe('6');
    pressKey('i');
    expect(getValue()).toBe('6');
    pressKey('x');
    expect(getValue()).toBe('6');
    pressKey('Backspace');
    pressKey('Backspace');
    pressKey('e');
    expect(getValue()).toBe('7');
    pressKey('v');
    expect(getValue()).toBe('7');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  "doesn't find disabled options (dropdown open: $isOpen)",
  ({ isOpen }) => {
    document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Third</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
      <option value="6">Sixth option</option>
      <option value="7">Seventh option</option>
    </select>
  `;

    select = document.querySelector('#select1');
    betterSelectInstance = new BetterSelect(select);
    betterSelect = select?.closest('.better-select') || null;

    betterSelectInstance!.toggle(true);
    selectOption('1');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('t');
    pressKey('h');
    pressKey('i');
    expect(getValue()).not.toBe('7');

    const thirdOption = select?.options[2]!;
    expect(thirdOption.disabled).toBe(true);
    thirdOption.removeAttribute('disabled');
    thirdOption.disabled = false;
    betterSelectInstance.updateUI();

    pressKey('r');
    pressKey('d');
    expect(getValue()).toBe('3');
  },
);

it.each([{ isOpen: true }, { isOpen: false }])(
  'clears the search after 2 seconds of inactivity (dropdown open: $isOpen)',
  ({ isOpen }) => {
    jest.useFakeTimers();
    document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
      <option value="6">Sixth option</option>
      <option value="7">Seventh option</option>
    </select>
  `;

    select = document.querySelector('#select1');
    betterSelectInstance = new BetterSelect(select);
    betterSelect = select?.closest('.better-select') || null;

    betterSelectInstance!.toggle(true);
    selectOption('1');
    betterSelectInstance!.toggle(isOpen);

    if (isOpen) {
      expect(getTemporarilySelectedOptionValue()).toBeNull();
    }

    pressKey('s');
    pressKey('i');
    pressKey('x');
    expect(getValue()).toBe('6');
    jest.advanceTimersByTime(2000);

    pressKey('s');
    pressKey('e');
    pressKey('v');
    expect(getValue()).toBe('7');
  },
);

it("doesn't throw errors for unhandled keys", () => {
  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select?.closest('.better-select') || null;

  betterSelectInstance!.toggle(true);
  selectOption('1');
  betterSelectInstance!.toggle(true);

  pressKey('ArrowLeft');
});

it('pressing Enter or Space on the trigger toggles the dropdown', () => {
  betterSelectInstance!.toggle(false);
  betterSelect?.focus();

  pressTriggerKey(' ');
  expect(betterSelectInstance!.opened).toBe(true);
  pressTriggerKey(' ');
  expect(betterSelectInstance!.opened).toBe(false);

  betterSelectInstance!.opened = false;
  pressTriggerKey('Enter');
  expect(betterSelectInstance!.opened).toBe(true);
  pressTriggerKey('Enter');
  expect(betterSelectInstance!.opened).toBe(false);
});

it('handles select fields with no enabled options', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1" disabled>Option 1</option>
      <option value="2" disabled>Option 2</option>
      <option value="3" disabled>Option 3</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select?.closest('.better-select') || null;

  betterSelectInstance!.toggle(true);
  pressKey('ArrowDown');
  expect(getTemporarilySelectedOptionValue()).toBeNull();
  pressKey('ArrowUp');
  expect(getTemporarilySelectedOptionValue()).toBeNull();
  pressKey('Enter');
  expect(getSelectedOptionValue()).toBeNull();
  expect(betterSelectInstance.value).toBe('');
  expect(select!.value).toBe('');
});
