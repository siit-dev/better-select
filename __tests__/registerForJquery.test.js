'use strict';

import '../__mocks__/stubs.mock';

it('displays a console warning if jQuery is missing', () => {
  const { registerForJquery } = require('../src/index');
  expect(window.jQuery).toBeUndefined();

  const previousConsoleWarn = console.warn;
  console.warn = jest.fn();
  registerForJquery();
  expect(console.warn).toHaveBeenCalled();
  console.warn = previousConsoleWarn;
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
  console.log(window.jQuery);
  registerForJquery();

  document.body.innerHTML = `
    <select name="select" id="select1">
      <option value="1">Option 1</option>
    </select>
  `;
  const select = document.querySelector('#select1');

  const $ = window.jQuery;
  expect($).toBeDefined();
  console.log($);
  $(select).betterSelect();
  expect(select.dataset.betterSelectInit).toBe('true');
});
