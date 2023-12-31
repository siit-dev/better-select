'use strict';

import '../__mocks__/stubs.mock';

import { it, expect, beforeAll, beforeEach } from '@jest/globals';

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
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4" selected>Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1')!;
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select.closest('.better-select')!;
});

it('parses the options from the native select', () => {
  const optionList = betterSelect!.querySelector('.better-select__dropdown-list')!;
  const options = optionList.querySelectorAll(':scope > li');
  const nativeOptions = select!.options;

  expect(options.length).toBe(nativeOptions.length);
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const optionAnchor = option.querySelector<HTMLElement>('[data-value]')!;
    const nativeOption = nativeOptions[i];
    expect(option.textContent).toBe(nativeOption.textContent);
    expect(optionAnchor.dataset.value).toBe(nativeOption.value);
    expect(option.classList.contains('is-disabled')).toBe(nativeOption.disabled);
  }
});

it('parses the current active option', () => {
  const optionList = betterSelect!.querySelector('.better-select__dropdown-list')!;

  const selectedOption = optionList.querySelector('.better-select__dropdown-list > li.is-active')!;
  const trigger = betterSelect!.querySelector('.better-select__trigger')!;
  expect(selectedOption.textContent).toBe(select!.options[select!.selectedIndex].textContent);
  expect(trigger.textContent).toBe(select!.options[select!.selectedIndex].textContent);
  expect(selectedOption.querySelector<HTMLElement>('[data-value]')!.dataset.value).toBe(
    select!.options[select!.selectedIndex].value,
  );
});

it('parses data-style attributes', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option data-style="--color: red" value="1">Option 1</option>
      <option data-style="--color: green" value="2">Option 2</option>
      <option data-style="--color: blue" value="3" disabled>Option 3</option>
      <option data-style="--color: white" value="4" selected>Option 4</option>
      <option data-style="--color: yellow" value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1')!;
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select.closest('.better-select')!;

  const optionList = betterSelect.querySelector('.better-select__dropdown-list')!;
  const options = optionList.querySelectorAll(':scope > li');
  const nativeOptions = select.options;
  for (let i = 0; i < options.length; i++) {
    const option = options[i] as HTMLOptionElement;
    const nativeOption = nativeOptions[i];
    expect(option.style.cssText).toContain(nativeOption.dataset.style);
  }
});
