// Suppress benign Chrome ResizeObserver dev errors that trigger the overlay
// See: https://crbug.com/937204 and common dev-server overlay behavior
(function () {
  if (typeof window === 'undefined') return;
  var suppressed = [
    'ResizeObserver loop completed with undelivered notifications.',
    'ResizeObserver loop limit exceeded',
  ];

  function isSuppressedMessage(msg) {
    return typeof msg === 'string' && suppressed.some(function (m) { return msg.indexOf(m) !== -1; });
  }

  window.addEventListener('error', function (e) {
    if (e && isSuppressedMessage(e.message)) {
      e.stopImmediatePropagation();
      if (typeof e.preventDefault === 'function') e.preventDefault();
      return false;
    }
  }, true);

  var origConsoleError = console.error;
  console.error = function () {
    if (arguments && arguments.length && isSuppressedMessage(arguments[0])) {
      return;
    }
    return origConsoleError.apply(this, arguments);
  };
})();

