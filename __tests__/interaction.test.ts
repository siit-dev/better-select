'use strict';

import { beforeAll, beforeEach, it, expect, jest, test } from '@jest/globals';
import '../__mocks__/stubs.mock';

import BetterSelect from '../src/index';
let betterSelect: HTMLDivElement | null = null,
  select: HTMLSelectElement | null = null,
  betterSelectInstance: BetterSelect | null = null;

beforeAll(() => {
  const { registerWebComponent } = require('../src/index');
  registerWebComponent();
});

beforeEach(() => {
  document.body.innerHTML = `
    <h1 id="title">Title</h1>
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select!.closest('.better-select');
});

const selectOption = (value: string | number) => {
  betterSelect
    ?.querySelector<HTMLAnchorElement>(`.better-select__dropdown-list [data-value="${value}"]`)
    ?.click();
};
const getSelectedOption = (): HTMLElement | null => {
  return betterSelect?.querySelector(`.better-select__dropdown-list li.is-active`) || null;
};
const getTrigger = (): HTMLElement | null => {
  return betterSelect?.querySelector(`.better-select__trigger`) || null;
};

it('selects a different option', () => {
  selectOption(2);
  const selected = getSelectedOption()!;
  expect(selected.querySelector<HTMLElement>('span')!.dataset.value).toBe('2');
  const trigger = getTrigger()!;
  expect(trigger.textContent).toBe('Option 2');
  expect(trigger.classList.contains('has-selected')).toBeTruthy();
});

it("doesn't select a disabled option", () => {
  selectOption(3);
  const selected = getSelectedOption()!;
  expect(selected.querySelector<HTMLElement>('span')!.dataset.value).not.toBe('3');
  const trigger = getTrigger()!;
  expect(trigger.textContent).not.toBe('Option 3');
});

it('uses the value instead of the text for an option without text', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1"></option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select!.closest('.better-select');
  selectOption(1);
  const selected = getSelectedOption()!;
  expect(selected.querySelector<HTMLElement>('[data-value]')!.dataset.value).toBe('1');
  const trigger = getTrigger()!;
  expect(trigger.textContent).toBe('1');
  expect(selected.textContent).toBe('1');
});

it('toggles the dropdown programatically', () => {
  let openedNumber = 0;
  let closedNumber = 0;
  betterSelect!.addEventListener('betterSelect.open', () => {
    openedNumber++;
  });
  betterSelect!.addEventListener('betterSelect.close', () => {
    closedNumber++;
  });
  const dropdown = betterSelect!.querySelector('.better-select__dropdown')!;
  expect(dropdown.classList.contains('open')).toBeFalsy();
  betterSelectInstance!.toggle();
  expect(betterSelectInstance!.opened).toBeTruthy();
  expect(dropdown.classList.contains('open')).toBeTruthy();
  betterSelectInstance!.toggle();
  expect(betterSelectInstance!.opened).toBeFalsy();
  expect(dropdown.classList.contains('open')).toBeFalsy();
  expect(openedNumber).toBe(1);
  expect(closedNumber).toBe(1);
  betterSelectInstance!.toggle(false);
  expect(dropdown.classList.contains('open')).toBeFalsy();
  expect(openedNumber).toBe(1);
  expect(closedNumber).toBe(2);
  betterSelectInstance!.toggle(true);
  expect(betterSelectInstance!.opened).toBeTruthy();
  expect(dropdown.classList.contains('open')).toBeTruthy();
  expect(openedNumber).toBe(2);
  expect(closedNumber).toBe(2);

  betterSelectInstance!.opened = false;
  expect(betterSelectInstance!.opened).toBeFalsy();
  expect(dropdown.classList.contains('open')).toBeFalsy();
  expect(openedNumber).toBe(2);
  expect(closedNumber).toBe(3);

  betterSelectInstance!.opened = true;
  expect(betterSelectInstance!.opened).toBeTruthy();
  expect(dropdown.classList.contains('open')).toBeTruthy();
  expect(openedNumber).toBe(3);
  expect(closedNumber).toBe(3);
});

it('toggles the dropdown when clicking the trigger', () => {
  let openedNumber = 0;
  let closedNumber = 0;
  betterSelect!.addEventListener('betterSelect.open', () => {
    openedNumber++;
  });
  betterSelect!.addEventListener('betterSelect.close', () => {
    closedNumber++;
  });
  const trigger = getTrigger()!;
  const dropdown = betterSelect!.querySelector('.better-select__dropdown')!;
  expect(dropdown.classList.contains('open')).toBeFalsy();
  trigger.click();
  expect(dropdown.classList.contains('open')).toBeTruthy();
  trigger.click();
  expect(dropdown.classList.contains('open')).toBeFalsy();
  expect(openedNumber).toBe(1);
  expect(closedNumber).toBe(1);
});

it('closes the dropdown when clicking outside', () => {
  let openedNumber = 0;
  let closedNumber = 0;
  betterSelect!.addEventListener('betterSelect.open', () => {
    openedNumber++;
  });
  betterSelect!.addEventListener('betterSelect.close', () => {
    closedNumber++;
  });
  const trigger = getTrigger()!;
  const dropdown = betterSelect!.querySelector('.better-select__dropdown')!;
  expect(dropdown!.classList.contains('open')).toBeFalsy();
  trigger!.click();
  expect(dropdown!.classList.contains('open')).toBeTruthy();

  const title = document.querySelector<HTMLElement>('#title');
  title!.click();
  expect(dropdown.classList.contains('open')).toBeFalsy();
  expect(openedNumber).toBe(1);
  expect(closedNumber).toBe(1);
});

it('triggers the change event when selecting a different option', () => {
  const changeCallback = jest.fn();
  betterSelect!.addEventListener('change', changeCallback);
  selectOption(2);
  expect(changeCallback).toHaveBeenCalledTimes(1);
  expect(select!.value).toBe('2');
});

it("doesn't trigger the change event when selecting the same option", () => {
  const changeCallback = jest.fn();
  betterSelect!.addEventListener('change', changeCallback);
  selectOption(2);
  expect(changeCallback).toHaveBeenCalledTimes(1);
  expect(select!.value).toBe('2');

  const changeCallback2 = jest.fn();
  betterSelect!.addEventListener('change', changeCallback2);
  selectOption(2);
  expect(changeCallback2).not.toHaveBeenCalled();
  expect(select!.value).toBe('2');
});

it("triggers the change event when selecting the same option, if 'alwaysTriggerChange' is true", () => {
  betterSelectInstance!.updateSettings({ alwaysTriggerChange: true });

  selectOption(1);

  const changeCallback = jest.fn();
  betterSelect!.addEventListener('change', changeCallback);
  selectOption(2);
  expect(changeCallback).toHaveBeenCalled();
  expect(select!.value).toBe('2');

  const changeCallback2 = jest.fn();
  betterSelect!.addEventListener('change', changeCallback2);
  selectOption(2);
  expect(changeCallback2).toHaveBeenCalled();
  expect(select!.value).toBe('2');
});

it("doesn't trigger the change event on clicking the placeholder", () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="">Placeholder</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select, {
    skipEmpty: false,
  });
  betterSelect = select!.closest('.better-select');
  betterSelectInstance.toggle(true);
  const changeCallback = jest.fn();
  betterSelect!.addEventListener('change', changeCallback);
  const firstOption = betterSelect!.querySelector<HTMLAnchorElement>(
    '.better-select__dropdown-list li:first-child span',
  )!;
  firstOption.click();
  expect(changeCallback).not.toHaveBeenCalled();
});

it("triggers the change event on clicking the placeholder if the 'alwaysTriggerChange' option is enabled", () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="">Placeholder</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select, {
    skipEmpty: false,
    alwaysTriggerChange: true,
  });
  betterSelect = select!.closest('.better-select');
  betterSelectInstance.toggle(true);
  const changeCallback = jest.fn();
  betterSelect!.addEventListener('change', changeCallback);
  const firstOption = betterSelect!.querySelector<HTMLAnchorElement>(
    '.better-select__dropdown-list li:first-child span',
  )!;
  firstOption.click();
  expect(changeCallback).toHaveBeenCalled();
});

test("resetting a form resets better-select's value", async () => {
  document.body.innerHTML = `
    <form id="simple-form">
      <select name="select" id="select1">
        <option value="">Placeholder</option>
        <option value="2">Option 2</option>
        <option value="3" disabled>Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
      <button type="reset" id="reset">Reset</button>
    </form>
  `;

  const form = document.querySelector<HTMLFormElement>('#simple-form')!;
  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select, {
    skipEmpty: false,
    alwaysTriggerChange: true,
  });
  betterSelect = select!.closest('.better-select');
  expect(betterSelectInstance!.value).toBe('');
  betterSelectInstance.toggle(true);
  betterSelectInstance.value = '2';
  expect(betterSelectInstance!.value).toBe('2');

  const resetButton = document.querySelector<HTMLButtonElement>('#reset')!;
  resetButton.click();

  // Wait for the reset to be applied
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(select?.value).toBe('');
  expect(betterSelectInstance!.value).toBe('');

  // Resetting the form programatically
  betterSelectInstance.value = '2';
  expect(betterSelectInstance!.value).toBe('2');
  form.reset();
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(betterSelectInstance!.value).toBe('');
});

it("doesn't allow to programmatically set a value that doesn't exist", () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="">Placeholder</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select, {
    skipEmpty: false,
    alwaysTriggerChange: true,
  });
  betterSelect = select!.closest('.better-select');

  betterSelectInstance.value = '6';
  expect(betterSelectInstance.value).toBe('');
});

it('allows to prevent the dropdown from opening/closing on click', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="">Placeholder</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select!.closest('.better-select');

  let toPreventOpen = true;
  betterSelect!.addEventListener('betterSelect.open', (event: CustomEvent) => {
    if (toPreventOpen) {
      event.preventDefault();
    }
  });

  let toPreventClose = true;
  betterSelect!.addEventListener('betterSelect.close', (event: CustomEvent) => {
    if (toPreventClose) {
      event.preventDefault();
    }
  });

  betterSelectInstance.toggle(true);
  expect(betterSelectInstance.opened).toBeFalsy();

  toPreventOpen = false;
  betterSelectInstance.toggle(true);
  expect(betterSelectInstance.opened).toBeTruthy();

  toPreventClose = true;
  betterSelectInstance.toggle(false);
  expect(betterSelectInstance.opened).toBeTruthy();

  toPreventClose = false;
  betterSelectInstance.toggle(false);
  expect(betterSelectInstance.opened).toBeFalsy();
});

it('prevents opening the dropdown for a disabled select', () => {
  document.body.innerHTML = `
    <select name="select" id="select1" disabled>
      <option value="">Placeholder</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select!.closest('.better-select');

  betterSelectInstance.toggle(true);
  expect(betterSelectInstance.opened).toBeFalsy();
});
