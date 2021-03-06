'use strict';

const EventEmitter = require('events');
const axios = require('axios');

module.exports = class SnowAlert extends EventEmitter {
  constructor(request, channelID, name) {
    super();
    this.request = request;
    this.channelID = channelID;
    this.name = name;
    // this.id = id;
    this.previousValue = null;
  }

  setchannelID(channelID) {
    this.channelID = channelID;
  }

  setRequest(request, name = 'user') {
    this.request = request;
    this.name = name;
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
        console.log('Emit: status-change', currentValue, this.channelID);
        this.emit('status-change', currentValue, this.channelID);
      }
    }
    this.previousValue = currentValue;
    return alert;
  }

  getLightStatus() {
    axios.get(this.request)
    .then((response) => {
      const status = response.data.features[0].attributes.STATUT;
      this.evaluate({ name: this.name, status });
    })
    .catch(error => console.log(error));
  }
}