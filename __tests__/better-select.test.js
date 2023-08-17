'use strict';

jest.mock('../dist/umd/index.js');

it('initializes a better select instance', () => {
  document.body.innerHTML = `
    <select name="select" id="select1" class="form-control">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
      <option value="4">Option 4</option>
      <option value="5">Option 5</option>
    </select>
  `;
});
