window.HTMLElement.prototype.scrollIntoView = function () {};

jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
