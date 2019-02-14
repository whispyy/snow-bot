'use strict';

const EventEmitter = require('events');
const axios = require('axios');

module.exports = class SnowAlert extends EventEmitter {
  constructor(request, message, name) {
    super();
    this.request = request;
    this.username = name;
    this.message = message;
    // this.id = id;
    this.previousValue = null;
  }

  setMessage(message) {
    this.message = message;
  }

  setRequest(request, name = 'user') {
    this.request = request;
    this.username = name;
  }

  startPoller() {
    console.log('Polling every 15 min');
    this.deferredObj = setTimeout(() => { this.startPoller(); }, 900000);

    this.getLightStatus();
  }

  stopPoller() {
    console.log('Stop polling');
    clearTimeout(this.deferredObj);
  }

  evaluate(currentValue) {
    let alert = false;
    if (this.previousValue && currentValue) {
      alert = this.previousValue.status !== currentValue.status;
      if (alert) {
        console.log('Emit: status-change', currentValue);
        this.emit('status-change', currentValue, this.message);
      }
    }
    this.previousValue = currentValue;
    return alert;
  }

  getLightStatus() {
    axios.get(this.request)
    .then((response) => {
      const status = response.data.features[0].attributes.STATUT;
      this.evaluate({ name: this.username, status });
    })
    .catch(error => {
      console.log(error);
    });
  }
}