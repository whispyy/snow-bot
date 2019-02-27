// debounce API call to avoid spam/flood
exports.debounce = (fn, time) => {
  let timeout;

  return function() {
    const functionCall = () => fn.apply(this, arguments);
    
    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  }
}

// parse date from timestamp
exports.parseDate = (date) => {
  return new Date(date).toLocaleString();
};

// return request corresponding to name in endpoint array
exports.getRequest = (name, jsonDatas) => {
  const data = jsonDatas.find(data => data.name.toUpperCase() === name.toUpperCase());
  return data.endpoint;
};