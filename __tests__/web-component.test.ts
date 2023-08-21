'use strict';

import { it, expect, beforeAll, test } from '@jest/globals';
import { getElementInternals } from '../__mocks__/ElementInternals.mock';
import '../__mocks__/stubs.mock';
import { BetterSelectComponent } from '../src';
import { registerWebComponent, defaultBetterSelectSettings } from '../src';

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

  const betterSelect = document.querySelector('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
});

it('allows getting and setting a value', () => {
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

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;

  betterSelect.value = '1';
  expect(betterSelect.value).toBe('1');
  expect(betterSelect.betterSelect!.value).toBe('1');
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

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  const firstInstance = betterSelect.betterSelect;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
  betterSelect.update();
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
  expect(firstInstance).not.toBe(betterSelect.betterSelect);
});

it("doesn't initialize a better select instance if no select is present", () => {
  document.body.innerHTML = `
    <better-select>
      <div>Not a select</div>
    </better-select>
  `;

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')).toBeNull();
  expect(betterSelect.betterSelect).toBeNull();
});

it('updates the better select instance if attributes change', () => {
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

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  const instance = betterSelect.betterSelect!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);

  // Check the placeholder.
  betterSelect.setAttribute('placeholder', 'Please select an option');
  expect(instance.settings.placeholder).toBe('Please select an option');
  betterSelect.setAttribute('placeholder', '');
  expect(instance.settings.placeholder).toBeFalsy();
  betterSelect.removeAttribute('placeholder');
  expect(instance.settings.placeholder).toBeFalsy();

  // Check the fixed-placeholder.
  betterSelect.setAttribute('fixed-placeholder', 'true');
  expect(instance.settings.fixedPlaceholder).toBe(true);
  betterSelect.setAttribute('fixed-placeholder', 'false');
  expect(instance.settings.fixedPlaceholder).toBe(false);
  betterSelect.removeAttribute('fixed-placeholder');
  expect(instance.settings.fixedPlaceholder).toBe(false);

  // Check the z-index.
  betterSelect.setAttribute('z-index', '100');
  expect(instance.settings.zIndex).toBe(100);
  betterSelect.setAttribute('z-index', '200');
  expect(instance.settings.zIndex).toBe(200);
  betterSelect.removeAttribute('z-index');
  expect(instance.settings.zIndex).not.toBe(200);

  // Check the "no-skip-empty" attribute.
  betterSelect.setAttribute('no-skip-empty', 'true');
  expect(instance.settings.skipEmpty).toBe(false);
  betterSelect.setAttribute('no-skip-empty', 'false');
  expect(instance.settings.skipEmpty).toBe(true);
  betterSelect.removeAttribute('no-skip-empty');
  expect(instance.settings.skipEmpty).toBe(true);

  // Check the "no-native-on-mobile" attribute.
  betterSelect.setAttribute('no-native-on-mobile', 'true');
  expect(instance.settings.nativeOnMobile).toBe(false);
  betterSelect.setAttribute('no-native-on-mobile', 'false');
  expect(instance.settings.nativeOnMobile).toBe(true);
  betterSelect.removeAttribute('no-native-on-mobile');
  expect(instance.settings.nativeOnMobile).toBe(true);

  // Check the mobile breakpoint.
  betterSelect.setAttribute('mobile-breakpoint', '100');
  expect(instance.settings.mobileBreakpoint).toBe(100);
  betterSelect.setAttribute('mobile-breakpoint', '200');
  expect(instance.settings.mobileBreakpoint).toBe(200);
  betterSelect.removeAttribute('mobile-breakpoint');
  expect(instance.settings.mobileBreakpoint).toBe(defaultBetterSelectSettings.mobileBreakpoint);

  // Check the "wrapper-class" attribute.
  betterSelect.setAttribute('wrapper-class', 'test-class');
  expect(instance.settings.wrapperClass).toBe('test-class');
  betterSelect.setAttribute('wrapper-class', 'test-class-2');
  expect(instance.settings.wrapperClass).toBe('test-class-2');
  betterSelect.removeAttribute('wrapper-class');
  expect(instance.settings.wrapperClass).toBe(defaultBetterSelectSettings.wrapperClass);

  // Check the "dropdown-class" attribute.
  betterSelect.setAttribute('dropdown-class', 'test-class');
  expect(instance.settings.dropdownClass).toBe('test-class');
  betterSelect.setAttribute('dropdown-class', 'test-class-2');
  expect(instance.settings.dropdownClass).toBe('test-class-2');
  betterSelect.removeAttribute('dropdown-class');
  expect(instance.settings.dropdownClass).toBe(defaultBetterSelectSettings.dropdownClass);

  // Check the "trigger-class" attribute.
  betterSelect.setAttribute('trigger-class', 'test-class');
  expect(instance.settings.triggerClass).toBe('test-class');
  betterSelect.setAttribute('trigger-class', 'test-class-2');
  expect(instance.settings.triggerClass).toBe('test-class-2');
  betterSelect.removeAttribute('trigger-class');
  expect(instance.settings.triggerClass).toBe(defaultBetterSelectSettings.triggerClass);

  // Check that it doesn't update if the attribute is not valid.
  betterSelect.setAttribute('invalid-attribute', 'test-class');
  expect((instance.settings as any).invalidAttribute).toBeUndefined();

  // Check that it doesn't update if the attribute has the same value.
  let initCount = 0;
  betterSelect.setAttribute('wrapper-class', 'test-class-2');
  betterSelect.addEventListener('betterSelect.init', () => {
    initCount++;
  });
  expect(initCount).toBe(0);
  expect(instance.settings.wrapperClass).toBe('test-class-2');
  betterSelect.setAttribute('wrapper-class', 'test-class-2');
  expect(initCount).toBe(0);
  expect(instance.settings.wrapperClass).toBe('test-class-2');
  betterSelect.setAttribute('wrapper-class', 'test-class');
  expect(initCount).toBe(1);
});

test('dynamically adding a new web component element initializes it', () => {
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

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');

  const newSelect = document.createElement('better-select');
  newSelect.innerHTML = `
    <select name="select" id="select2">
      <option value="1">Option 1</option>
    </select>
  `;
  document.body.appendChild(newSelect);

  expect(newSelect).toBeInstanceOf(BetterSelectComponent);
  expect(newSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
});

test('moving a web component element reinitializes it', () => {
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

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
  const firstInstance = betterSelect.betterSelect;

  // Create, append, and move the element.
  const newDiv = document.createElement('div');
  document.body.appendChild(newDiv);
  newDiv.appendChild(betterSelect);
  const secondInstance = betterSelect.betterSelect;
  expect(secondInstance).not.toBe(firstInstance);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');

  // Create, move and append the element.
  const thirdDiv = document.createElement('div');
  thirdDiv.appendChild(betterSelect);
  document.body.appendChild(thirdDiv);
  const thirdInstance = betterSelect.betterSelect;
  expect(thirdInstance).not.toBe(firstInstance);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
});

test('it updates the ElementInternals when the value changes', async () => {
  document.body.innerHTML = `
    <form>
      <better-select>
        <select name="select" id="select1" required>
          <option value="" selected>Select an option</option>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
          <option value="4">Option 4</option>
          <option value="5">Option 5</option>
        </select>
      </better-select>
    </form>
  `;

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
  expect(betterSelect.attachInternals).toBeDefined();
  expect((betterSelect.constructor as typeof BetterSelectComponent).formAssociated).toBe(true);

  const internals = getElementInternals(betterSelect);
  expect(internals).not.toBeNull();
  expect(internals.getFormValue()).toBe(betterSelect.value);
  expect(internals.checkValidity()).toBe(false);
  expect(internals.validationMessage).toBeTruthy();
  expect(internals.validity).toMatchObject({
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: false,
    valueMissing: true,
  });

  betterSelect.betterSelect!.value = '1';
  expect(internals.getFormValue()).toBe('1');
  expect(internals.checkValidity()).toBe(true);
  expect(internals.validationMessage).toBeFalsy();
  expect(internals.validity).toMatchObject({
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: true,
    valueMissing: false,
  });

  const form = document.querySelector('form')!;
  form.reset();
  await new Promise(resolve => setTimeout(resolve, 10));

  expect(internals.getFormValue()).toBe('');
  expect(internals.checkValidity()).toBe(false);
});

test("it doesn't fail if the browser doesn't support ElementInternals", () => {
  const originalAttachInternals = HTMLElement.prototype.attachInternals;
  (HTMLElement.prototype as any).attachInternals = undefined;

  document.body.innerHTML = `
    <better-select>
      <select name="select" id="select1" required>
        <option value="" selected>Select an option</option>
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
        <option value="4">Option 4</option>
        <option value="5">Option 5</option>
      </select>
    </better-select>
  `;

  const betterSelect = document.querySelector<BetterSelectComponent>('better-select')!;
  expect(betterSelect).toBeInstanceOf(BetterSelectComponent);
  expect(betterSelect.querySelector('select')!.dataset.betterSelectInit).toBe('true');
  expect(betterSelect.attachInternals).toBeUndefined();
  betterSelect.betterSelect!.value = '1';
  expect(betterSelect.betterSelect!.value).toBe('1');
  betterSelect._updateInternals();

  const internals = getElementInternals(betterSelect);
  expect(internals).toBeUndefined();

  HTMLElement.prototype.attachInternals = originalAttachInternals;
});
