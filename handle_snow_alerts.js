'use strict';

const SnowAlert = require('./snow_alert.js');
const EventEmitter = require('events');

module.exports = class HandleSnowAlerts extends EventEmitter {
  constructor() {
    super();
    this.alerts = [];
  }

  add(newAlert) {
    const alertObj = {
      name: newAlert.name,
      message: newAlert.message,
      request: newAlert.request
      // id: `${newAlert.message.channel.id}-${newAlert.name}`
    };
    const foundAlert = this.alerts.find(alert => alert.name == alertObj.name);
    if (foundAlert) {
      this.remove(foundAlert);
    }
    this.build(alertObj);
  }

  build(alertObj) {
    const alert = new SnowAlert(alertObj.request, alertObj.message, alertObj.name, alertObj.id);
    this.alerts.push(alert);
    alert.startPoller();
    alert.on('status-change', (data, msg) => {
      this.emit('alerts-status', data, msg);
    })
  }

  remove(name) {
    const alert = this.alerts.find(alert => alert.name == name);
    if (alert) {
      alert.stopPoller();
      this.alerts = this.alerts.filter(alert => alert.name == name);
    }
  }

  removeAll() {
    this.alerts.forEach(alert => alert.stopPoller());
    this.alerts = [];
  }

  listAll(msg) {
    this.emit('alerts-list', this.alerts, msg);
  }
}