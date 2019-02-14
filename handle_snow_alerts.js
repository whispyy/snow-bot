'use strict';

const SnowAlert = require('./snow_alert.js');
const EventEmitter = require('events');

module.exports = class HandleSnowAlerts extends EventEmitter {
  constructor(alerts) {
    super();
    this.alerts = [];
  }

  addAlert(newAlert) {
    const alert = this.alerts.find(alert => alert.name == newAlert.id);
    if (alert) {
      this.removeAlert(alert);
    }
    const buildedAlert = this.buildAlert(newAlert);
    this.alerts.push(buildedAlert);
  }

  buildAlert(newAlert) {
    const alert = new SnowAlert(newAlert.request, newAlert.message, newAlert.name);
    alert.startPoller();
    alert.on('status-change', (data, msg) => {
      this.emit('alerts-status', data, msg);
    })
  }

  removeAlert(newAlert) {
    const alert = this.alerts.find(alert => alert.id == newAlert.id);
    if (alert) {
      alert.stopPoller();
      this.alerts = this.alerts.filter(alert => alert.id == newAlert.id);
    }
  }

  removeAll() {
    this.alerts.forEach(alert => alert.stopPoller());
    this.alerts = [];
  }
}