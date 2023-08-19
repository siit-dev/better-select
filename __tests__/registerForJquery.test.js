'use strict';

import '../__mocks__/stubs.mock';

it('displays a console warning if jQuery is missing', () => {
  const { registerForJquery } = require('../src/index');
  expect(window.jQuery).toBeUndefined();

  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  registerForJquery();
  expect(warn).toHaveBeenCalled();
  warn.mockReset();
});

it('registers the jquery plugin if jQuery is present', () => {
  const { registerForJquery } = require('../src/index');
  window.jQuery = jest.mock('jquery');
  registerForJquery();
  expect(window.jQuery.fn.betterSelect).toBeDefined();
  delete window.jQuery;
  jest.unmock('jquery');
});

it("initializes a better select instance using jQuery's plugin", () => {
  const { registerForJquery } = require('../src/index');
  window.jQuery = require('jquery');
  registerForJquery();

  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
    </select>
  `;
  const select = document.querySelector('#select1');

  const $ = window.jQuery;
  expect($).toBeDefined();
  $(select).betterSelect();
  expect(select.dataset.betterSelectInit).toBe('true');
});
