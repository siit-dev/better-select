'use strict';

import '../__mocks__/stubs.mock';
const { registerWebComponent, BetterSelectComponent } = require('../src/index');

beforeAll(() => {
  registerWebComponent();
});

it('initializes a better select instance using web components', () => {
  document.body.innerHTML = `
    <better-select>
      <select name="select" id="select1">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </better-select>
  `;

  const betterSelect = document.querySelector('better-select');
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select').dataset.betterSelectInit).toBe('true');
});

it('reinitializes the better select instance when running update', () => {
  document.body.innerHTML = `
    <better-select>
      <select name="select" id="select1">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </better-select>
  `;

  const betterSelect = document.querySelector('better-select');
  const firstInstance = betterSelect.betterSelect;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select').dataset.betterSelectInit).toBe('true');
  betterSelect.update();
  expect(betterSelect.querySelector('select').dataset.betterSelectInit).toBe('true');
  expect(firstInstance).not.toBe(betterSelect.betterSelect);
});

it("doesn't initialize a better select instance if no select is present", () => {
  document.body.innerHTML = `
    <better-select>
      <div>Not a select</div>
    </better-select>
  `;

  const betterSelect = document.querySelector('better-select');
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')).toBeNull();
  expect(betterSelect.betterSelect).toBeNull();
});

it.skip('updates the better select instance if attributes change', () => {
  document.body.innerHTML = `
    <better-select>
      <select name="select" id="select1">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </better-select>
  `;

  const betterSelect = document.querySelector('better-select');
  const instance = betterSelect.betterSelect;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);

  // Check the placeholder.
  betterSelect.setAttribute('placeholder', 'Please select an option');
  expect(instance.settings.placeholder).toBe('Please select an option');
  betterSelect.setAttribute('placeholder', '');
  expect(instance.settings.placeholder).toBe('');
});
