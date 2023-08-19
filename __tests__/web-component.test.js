'use strict';

import '../__mocks__/stubs.mock';
const { registerWebComponent, BetterSelectComponent, defaultBetterSelectSettings } = require('../src/index');

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

  const betterSelect = document.querySelector('better-select');
  const instance = betterSelect.betterSelect;
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
  expect(instance.settings.invalidAttribute).toBeUndefined();

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
