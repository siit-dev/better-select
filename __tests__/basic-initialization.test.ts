'use strict';

import { it, expect, test } from '@jest/globals';
import '../__mocks__/stubs.mock';
import { defaultBetterSelectSettings } from '../src/BetterSelect';

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

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const betterSelect = new BetterSelect(select);
  expect(betterSelect).toBeInstanceOf(BetterSelect);
  expect(select.dataset.betterSelectInit).toBe('true');
  expect(select.parentElement!.classList.contains('better-select')).toBe(true);

  expect(betterSelect.select).toBe(select);
  expect(betterSelect.element).toBe(select);
  expect(betterSelect.dropdownEl).toBe(
    select.parentElement!.querySelector('.better-select__dropdown'),
  );
  expect(betterSelect.triggerEl).toBe(
    select.parentElement!.querySelector('.better-select__trigger'),
  );
  expect(betterSelect.wrapperEl).toBe(select.parentElement);
});

it('accepts custom CSS classes', () => {
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

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const betterSelect = new BetterSelect(select, {
    wrapperClass: 'custom-wrapper-class',
    dropdownClass: 'custom-dropdown-class',
    triggerClass: 'custom-trigger-class',
  });
  expect(betterSelect).toBeInstanceOf(BetterSelect);
  expect(select.dataset.betterSelectInit).toBe('true');
  expect(select.parentElement!.classList.contains('custom-wrapper-class')).toBe(true);

  expect(betterSelect.select).toBe(select);
  expect(betterSelect.element).toBe(select);
  expect(betterSelect.dropdownEl).toBe(
    select.parentElement!.querySelector('.custom-dropdown-class'),
  );
  expect(betterSelect.triggerEl).toBe(select.parentElement!.querySelector('.custom-trigger-class'));
});

it("doesn't initialize with a non-select element", () => {
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

  const selectOption = document.querySelector<HTMLOptionElement>('#select1 option')!;
  expect(() => new BetterSelect(selectOption)).toThrowError('Wrong element');
  expect(selectOption.dataset.betterSelectInit).toBeFalsy();
});

it("doesn't initialize twice", () => {
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

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const firstInstance = new BetterSelect(select);
  const secondInstance = new BetterSelect(select);
  expect(firstInstance).not.toBe(secondInstance);
  expect(select.dataset.betterSelectInit).toBe('true');
  expect(select.betterSelectInstance).toBe(firstInstance);
});

it('destroys a better select instance', () => {
  const BetterSelect = require('../src/index').default;

  document.body.innerHTML = `
    <select name="select" id="select1" style="color: red">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const instance = new BetterSelect(select);
  instance.destroy();
  expect(select.dataset.betterSelectInit).toBeFalsy();
  expect(select.closest('.better-select')).toBeFalsy();
  expect(select.betterSelectInstance).toBeFalsy();
  expect(select.style.cssText).toBe('color: red;');
  expect(document.querySelector('.better-select')).toBeFalsy();
});

test('dynamically adding new options to the select updates the better select instance', async () => {
  const BetterSelect = require('../src/index').default;

  document.body.innerHTML = `
    <select name="select" id="select1" style="color: red">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const instance = new BetterSelect(select);
  const newOption = document.createElement('option');
  const betterSelect = select.closest('.better-select')!;
  newOption.value = '6';
  newOption.textContent = 'Option 6';
  select.appendChild(newOption);
  expect(select.dataset.betterSelectInit).toBeTruthy();
  expect(select.betterSelectInstance).toBe(instance);

  // wait a bit for the mutation observer to fire
  await new Promise(resolve => setTimeout(resolve, 100));

  expect(
    betterSelect.querySelector('.better-select__dropdown-list')!.querySelectorAll('li').length,
  ).toBe(6);
  expect(
    betterSelect.querySelector('.better-select__dropdown-list [data-value="6"]')?.textContent,
  ).toBe('Option 6');
});

it('allows using an existing wrapper', () => {
  const BetterSelect = require('../src/index').default;

  document.body.innerHTML = `
    <div class="custom-wrapper">
      <select name="select" id="select1" style="color: red">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </div>
  `;

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const customWrapper = document.querySelector('.custom-wrapper');
  expect(customWrapper).toBeInstanceOf(HTMLElement);
  const instance = new BetterSelect(select, {
    wrapperEl: customWrapper,
  });
  const defaultSettings = defaultBetterSelectSettings;
  expect(select.dataset.betterSelectInit).toBeTruthy();
  expect(instance.wrapperEl).toBe(customWrapper);
  expect(select.parentElement).toBe(customWrapper);
  expect(select.parentElement!.classList.contains(defaultSettings.wrapperClass)).toBeTruthy();

  // Destroy the instance and check that the wrapper is still there
  instance.destroy();
  expect(select.parentElement).toBe(customWrapper);
  expect(select.parentElement!.classList.contains(defaultSettings.wrapperClass)).toBeFalsy();
});

it('uses the default settings if no settings are given', () => {
  const BetterSelect = require('../src/index').default;

  document.body.innerHTML = `
    <select name="select" id="select1" style="color: red">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </select>
  `;

  const select = document.querySelector<HTMLSelectElement>('#select1')!;
  const instance = new BetterSelect(select);
  expect(select.dataset.betterSelectInit).toBeTruthy();

  const defaultSettings = defaultBetterSelectSettings;
  delete (defaultSettings as any).wrapperEl;
  delete defaultSettings.zIndex;
  const instanceSettings = instance.settings;
  delete instanceSettings.wrapperEl;
  delete instanceSettings.zIndex;

  expect(instanceSettings).toEqual(defaultSettings);
});
