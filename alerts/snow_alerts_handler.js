'use strict';

const SnowAlert = require('./snow_alert.js');

const EventEmitter = require('events');
const CircularJSON = require('circular-json');
const storage = require('node-persist');

module.exports = class SnowAlertsHandler extends EventEmitter {
  constructor() {
    super();
    this.alerts = [];
    this.storage = false;
  }

  initStorage() {
    this.storage = true;
    storage.init({
      dir: './',
      stringify: CircularJSON.stringify,
      parse: JSON.parse,
      encoding: 'utf8',
      logging: false,
      ttl: false,
      forgiveParseErrors: false
    })
      .then(() => this.recover())
      .catch(err => console.log('Error init storage', err));
  }

  add(newAlert) {
    let alertObj = {
      name: newAlert.name,
      channelID: newAlert.channelID,
      request: newAlert.request,
      mentionName: newAlert.mentionName || null,
      // id: `${newAlert.channelID}-${newAlert.name}`
    };
    const foundAlert = this.alerts.find(alert => alert.name == alertObj.name);
    if (foundAlert) {
      this.remove(foundAlert);
    }
    this.build(alertObj);

    // save alerts in file
    if (this.storage) {
      this.save();
    }
  }

  build(alertObj) {
    const alert = new SnowAlert(alertObj.request, alertObj.channelID, alertObj.name, alertObj.mentionName);
    this.alerts.push(alert);
    alert.startPoller();
    alert.on('status-change', (data, channelID) => {
      this.emit('alerts-status', data, channelID);
    });
  }

  linkMention(name, mentionName) {
    const linkedAlert = this.alerts.find(alert => name == alert.name);
    if (linkedAlert) {
      linkedAlert.setMention(mentionName);
      this.alerts = this.alerts.filter(alert => alert.name !== name);
      this.alerts.push(linkedAlert);

      // update storage
      if (this.storage) {
        storage.removeItem('alerts')
          .then(() => this.save())
          .catch(err => console.log('Error remove item', err));;
      }
    }
  }

  remove(name) {
    const alert = this.alerts.find(alert => alert.name == name);
    if (alert) {
      alert.stopPoller();
      this.alerts = this.alerts.filter(alert => alert.name != name);

      // update storage
      if (this.storage) {
        storage.removeItem('alerts')
          .then(() => this.save())
          .catch(err => console.log('Error remove item', err));;
      }
    }
  }

  removeAll() {
    this.alerts.forEach(alert => alert.stopPoller());
    this.alerts = [];
    // clear register
    if (this.storage) {
      storage.removeItem('alerts')
        .then((ok) => console.log('Success clear storage', ok))
        .catch(err => console.log('Error clear storage', err));
    }
  }

  listAll(channelID) {
    this.emit('alerts-list', this.alerts, channelID);
  }

  recover() {
    // check existing alerts to add
    storage.getItem('alerts')
      .then((alerts) => {
        if (alerts) {
          alerts.forEach(alert => this.build(alert));
        }
      })
      .catch(err => console.log('Error read storage', err));
  }

  save() {
    storage.setItem('alerts', this.alerts)
      .then((ok) => console.log('Success save in storage', ok))
      .catch(err => console.log('Error save in storage', err));
  }
}