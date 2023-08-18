import './matchMedia.mock.js';

window.HTMLElement.prototype.scrollIntoView = function () {};

jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
