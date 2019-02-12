'use strict';

module.exports = class SnowAlert {
  constructor(message) {
    this.message = message;
    this.previousValue = null;
  }

  setMessage(message) {
    this.message = message;
  }

  startPoller(currentValue) {
    console.log('Polling');
    this.deferredObj = setTimeout(() => { this.startPoller(); }, 1500);

    this.evaluate(currentValue);
  }

  stopPoller() {
    console.log('Stop polling');
    clearTimeout(this.deferredObj);
  }

  evaluate(currentValue) {
    let alert = false;
    if (this.previousValue && currentValue) {
      console.log(this.previousValue, currentValue);
      alert = this.previousValue.status !== currentValue.status;
    }
    this.previousValue = currentValue;
    return alert;
  }
}