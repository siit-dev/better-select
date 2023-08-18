'use strict';

import '../__mocks__/stubs.mock';

import BetterSelect from '../src/index';
let betterSelect, select, betterSelectInstance;

beforeAll(() => {
  const { registerWebComponent } = require('../src/index');
  registerWebComponent();
});

it('parses the placeholder from an empty option', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="" disabled selected>Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  betterSelectInstance = new BetterSelect(select);
  betterSelect = select.closest('.better-select');

  const trigger = betterSelect.querySelector('.better-select__trigger');
  expect(trigger.textContent).toBe('Select an option');
  expect(trigger.classList.contains('has-selected')).toBe(false);
});

it('parses the placeholder from the placeholder setting', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="" disabled selected>Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  const placeholder = 'Please select an option';
  betterSelectInstance = new BetterSelect(select, {
    placeholder,
  });
  betterSelect = select.closest('.better-select');

  const trigger = betterSelect.querySelector('.better-select__trigger');
  expect(trigger.textContent).toBe(placeholder);
  expect(trigger.classList.contains('has-selected')).toBe(false);
});

it('parses the placeholder from the placeholder setting when using web components', () => {
  const placeholder = 'Please select an option';

  document.body.innerHTML = `
    <better-select placeholder="${placeholder}">
      <select name="select" id="select-placeholder">
        <option value="" disabled selected>Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3" disabled>Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </better-select>
  `;

  select = document.querySelector('#select-placeholder');
  betterSelect = select.closest('.better-select');

  const trigger = betterSelect.querySelector('.better-select__trigger');
  expect(trigger.textContent).toBe(placeholder);
  expect(trigger.classList.contains('has-selected')).toBe(false);
});

it('keeps a fixed placeholder', () => {
  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="" disabled selected>Select an option</option>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3" disabled>Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  select = document.querySelector('#select1');
  const placeholder = 'Please select an option';
  betterSelectInstance = new BetterSelect(select, {
    placeholder,
    fixedPlaceholder: true,
  });
  betterSelect = select.closest('.better-select');

  const trigger = betterSelect.querySelector(`.better-select__trigger`);
  const option5 = betterSelect.querySelector(`.better-select__dropdown-list li a[data-value="5"]`);
  option5.click();
  expect(trigger.textContent).toBe(placeholder);
  expect(select.value).toBe('5');
  expect(trigger.classList.contains('has-selected')).toBe(true);
});
