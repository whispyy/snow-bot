'use strict';

const axios = require('axios');

module.exports = class SnowAlert {
  constructor(request, message) {
    this.message = message;
    this.request = request;
    this.previousValue = null;
  }

  setMessage(message) {
    this.message = message;
  }

  setRequest(request) {
    this.request = request;
  }

  startPoller() {
    console.log('Polling');
    this.deferredObj = setTimeout(() => { this.startPoller(); }, 1500);

    this.getLightStatus();
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

  getLightStatus() {
    axios.get(this.request)
    .then((response) => {
      const status = response.data.features[0].attributes.STATUT;
      this.evaluate(status);
    })
    .catch(error => {
      console.log(error);
    });
}
}