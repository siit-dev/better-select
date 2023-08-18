'use strict';

import './matchMedia.mock';

it('initializes a better select instance using JS', () => {
  const BetterSelect = require('../src/index').default;

  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  const select = document.querySelector('#select1');
  const betterSelect = new BetterSelect(select);
  expect(betterSelect).toBeInstanceOf(BetterSelect);
  expect(select.dataset.betterSelectInit).toBe('true');
  expect(select.parentElement.classList.contains('better-select')).toBe(true);
});

it('initializes a better select instance using web components', () => {
  const { registerWebComponent, BetterSelectComponent } = require('../src/index');
  registerWebComponent();

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
