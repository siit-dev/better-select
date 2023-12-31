import './scss/main.scss';
import './scss/demo-vanilla.scss';
import { registerWebComponent } from '.';

registerWebComponent();

document.addEventListener('DOMContentLoaded', () => {
  // Do something
  const simpleForm = document.querySelector('#simple-form');
  if (simpleForm) {
    simpleForm.addEventListener('submit', event => {
      event.preventDefault();
      simpleForm.classList.add('was-validated');
    });
  }
});
