// If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
exports.debounce = (func, wait, immediate) => {
  let timeout;
  return () => {
    const context = this, args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (immediate && !timeout) func.apply(context, args);
  };
};

// parse date from timestamp
exports.parseDate = (date) => {
  return new Date(date).toLocaleString();
};