export class ElementInternals {
  value = null;
  validity = {};
  form = null;
  validationMessage = '';
  element = null;
  realElement = null;

  constructor(element) {
    this.element = element;
    this.form = this.element.closest('form');
    this.realElement = this.element.querySelector('select');

    this.setFormValue = jest.fn().mockImplementation(value => {
      this.value = value;
    });

    this.getFormValue = jest.fn().mockImplementation(() => {
      return this.value;
    });
  }

  get form() {
    return this.form;
  }

  get validationMessage() {
    return this.validationMessage;
  }

  get willValidate() {
    return this.willValidate;
  }

  get value() {
    return this.value;
  }

  set value(value) {
    this.value = value;
  }

  setValidity(validity, message = '') {
    this.validity = validity;
    this.validationMessage = message;
  }

  checkValidity() {
    return this.validity?.valid;
  }

  reportValidity() {
    return;
  }
}

const internals = new WeakMap();

HTMLElement.prototype.attachInternals = jest.fn().mockImplementation(function () {
  const internalElement = new ElementInternals(this);
  internals.set(this, internalElement);

  return internalElement;
});

/**
 *
 * @param {HTMLElement} element
 * @returns {ElementInternals}
 */
export const getElementInternals = element => {
  return internals.get(element);
};
