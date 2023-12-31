'use strict';

import { beforeAll, beforeEach, it, expect, jest } from '@jest/globals';
import '../__mocks__/stubs-extra.mock';
import '../__mocks__/matchMedia-configurable.mock';

import BetterSelect from '../src/index';
import { setMatchMedia } from '../__mocks__/matchMedia-configurable.mock';
let betterSelect: HTMLDivElement | null = null,
  select: HTMLSelectElement | null = null,
  betterSelectInstance: BetterSelect | null = null;

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

  setMatchMedia(true);
});

it('keeps the native select visible on mobile', () => {
  expect(select?.style.visibility).toBe('visible');

  betterSelectInstance!.updateUI();
  expect(select?.style.visibility).toBe('visible');

  setMatchMedia(false);
  expect(select?.style.visibility).toBe('hidden');

  setMatchMedia(true);
  expect(select?.style.visibility).toBe('visible');
});

it("doesn't open the dropdown on mobile", () => {
  const trigger = betterSelect?.querySelector<HTMLElement>('.better-select__trigger')!;
  trigger.click();
  expect(betterSelect?.classList.contains('open')).toBeFalsy();
  expect(betterSelectInstance?.opened).toBeFalsy();
});

it("doesn't open the dropdown on mobile on Enter", () => {
  const trigger = betterSelect?.querySelector<HTMLElement>('.better-select__trigger')!;
  trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  expect(betterSelect?.classList.contains('open')).toBeFalsy();
  expect(betterSelectInstance?.opened).toBeFalsy();
});

it('closes the open dropdown when switching to mobile', () => {
  setMatchMedia(false);
  betterSelectInstance?.toggle(true);
  expect(betterSelectInstance?.opened).toBeTruthy();

  setMatchMedia(true);
  expect(betterSelectInstance?.opened).toBeFalsy();

  setMatchMedia(false);
  expect(betterSelectInstance?.opened).toBeFalsy();
  betterSelectInstance?.toggle(true);
  expect(betterSelectInstance?.opened).toBeTruthy();
});

it('displays the custom dropdown if nativeOnMobile is false', () => {
  betterSelectInstance?.destroy();
  betterSelectInstance = new BetterSelect(select, { nativeOnMobile: false });
  betterSelect = select!.closest('.better-select');

  // Desktop
  setMatchMedia(false);
  betterSelectInstance?.toggle(true);
  expect(betterSelectInstance?.opened).toBeTruthy();
  expect(betterSelect?.classList.contains('open')).toBeTruthy();
  betterSelectInstance?.toggle(false);
  expect(select?.style.visibility).toBe('hidden');

  // Mobile
  const callback = jest.fn();
  betterSelect?.addEventListener('betterSelect.mobileBreakpoint', callback);
  setMatchMedia(true);
  expect(callback).toHaveBeenCalled();
  betterSelectInstance?.toggle(true);
  expect(betterSelectInstance?.opened).toBeTruthy();
  expect(betterSelect?.classList.contains('open')).toBeTruthy();
  expect(betterSelectInstance.isMobileAndNative()).toBeFalsy();
  expect(select?.style.visibility).toBe('hidden');

  betterSelectInstance.updateUI();
  expect(select?.style.visibility).toBe('hidden');
});
