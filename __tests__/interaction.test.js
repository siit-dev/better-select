'use strict';

import './matchMedia.mock';

import BetterSelect from '../src/index';
let betterSelect, select, betterSelectInstance;

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

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select.closest('.better-select');
});

const selectOption = value => {
  betterSelect?.querySelector(`.better-select__dropdown-list a[data-value="${value}"]`)?.click();
};
const getSelectedOption = () => {
  return betterSelect?.querySelector(`.better-select__dropdown-list li.is-active`);
};
const getTrigger = () => {
  return betterSelect?.querySelector(`.better-select__trigger`);
};

it('selects a different option', () => {
  selectOption(2);
  const selected = getSelectedOption();
  expect(selected.querySelector('a').dataset.value).toBe('2');
  const trigger = getTrigger();
  expect(trigger.textContent).toBe('Option 2');
  expect(trigger.classList.contains('has-selected')).toBeTruthy();
});

it("doesn't select a disabled option", () => {
  selectOption(3);
  const selected = getSelectedOption();
  expect(selected.querySelector('a').dataset.value).not.toBe('3');
  const trigger = getTrigger();
  expect(trigger.textContent).not.toBe('Option 3');
});
