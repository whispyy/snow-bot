'use strict';

const SnowAlert = require('./snow_alert.js');
const EventEmitter = require('events');
const fs = require('fs');

module.exports = class SnowAlertsHandler extends EventEmitter {
  constructor() {
    super();
    this.alerts = [];
  }

  backup() {
    // check existing alerts to add
    fs.exists('save_alerts.json', (exists) => {
      if(exists) {
          fs.readFile('save_alerts.json', function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
              const obj = JSON.parse(data);  
              console.log(obj);
            }
          });
      }
    });
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

    // save alert in file
    // const json = JSON.stringify(alertObj);
    // fs.writeFile('save_alerts.json', json, 'utf8', callback);
  }

  build(alertObj) {
    const alert = new SnowAlert(alertObj.request, alertObj.message, alertObj.name, alertObj.id);
    this.alerts.push(alert);
    alert.startPoller();
    alert.on('status-change', (data, msg) => {
      this.emit('alerts-status', data, msg);
    });
  }

  remove(name) {
    const alert = this.alerts.find(alert => alert.name == name);
    if (alert) {
      alert.stopPoller();
      this.alerts = this.alerts.filter(alert => alert.name != name);
      // remove from registered
    }
  }

  removeAll() {
    this.alerts.forEach(alert => alert.stopPoller());
    this.alerts = [];
    // clear register
  }

  listAll(msg) {
    this.emit('alerts-list', this.alerts, msg);
  }
}