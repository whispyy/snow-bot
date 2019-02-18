require('dotenv').load();

const Discord = require('discord.js');
const axios = require('axios');

const endpoints = require('./endpoint.json');
const keep_alive = require('./keep_alive.js');
const SnowAlertsHandler = require('./alerts/snow_alerts_handler.js');

const client = new Discord.Client();
const token = process.env.DISCORD_BOT_SECRET;
const alerts = new SnowAlertsHandler();

client.on('ready', () => {
  console.log(`Connected as: ${client.user.username}`);

  // check for existing alerts
  alerts.recover();
});

client.on('message', msg => {
  if (msg.content[0] == '!' && msg.author.id != client.user.id) {
    let args = msg.content.substring(1).split(' ');
    let cmd = args[0];
    args = args.splice(1);
    console.log('activate:', msg.content);

    switch (cmd) {
      case 'ping':
        msg.channel.send('snow pong');
        break;
      case 'help':
        const helpAPI = endpoints.commands;
        msg.channel.send('__Available Commands :__');
        getHelp(helpAPI, msg);
        break;
      case 'alert':
        if(args[0] && args[0] == 'list') {
          return alerts.listAll(msg);
        }
        if(args[0] && args[0] == 'on') {
          msg.channel.send(`Turning on automatic alert for *${args[1]}*`);
          if (args[1]) {
            const req = getRequest(args[1], endpoints.endpoints);
            if (req && req.length) {
              const newAlert = {
                name: args[1].toUpperCase(),
                request: req,
                message: msg
              };
              return alerts.add(newAlert);
            }
            msg.channel.send(`Error: name *${args[1]}* doesn't match with stored data`);
          }
           msg.channel.send('Precise name : !alert on <name>');
        }
        if (!args[0] || args[0] && args[0] == 'off') {
          if (args[1]) {
            msg.channel.send(`Turning off automatic alert for *${args[1]}*`);
            return alerts.remove(args[1].toUpperCase());
          }
          msg.channel.send('Turning off automatic alert');
          return alerts.removeAll();
        }
        break;
      case 'snow':
        const API = endpoints.endpoints;
        if (!args[0] || args[0] && args[0] == 'all') {
          msg.channel.send('__État des feux :__');
          getAllSnowLight(API, msg);
        }
        if (args[0] && args[0] !== 'all') {
          getSpecificSnowLight(args[0], API, msg);
        }
        break;
    }
  }
});

client.login(token);

alerts.on('alerts-status', (data, msg) => {
  msg.channel.send(`**ALERTE** !
    Nom : ${data.name} - Feu : ${data.status}`);
});

alerts.on('alerts-list', (data, msg) => {
  msg.channel.send('__Liste des alertes :__');
  data.forEach(alert => msg.channel.send(`- ${alert.name} sera alerté.`));
});


function getRequest(name, datas) {
  const data = datas.find(data => data.name.toUpperCase() === name.toUpperCase());
  return data.endpoint;
}

// search light status for a specific name
function getSpecificSnowLight(name, datas, msg) {
  const data = datas.find(data => data.name.toUpperCase() === name.toUpperCase());
  if (data && data.endpoint) {
    return getSnowLightRequest(data.endpoint, msg, name);
  }
  return msg.channel.send(`Error: name *${name}* doesn't match with stored data`);
}

// return light status for each endpoint in endpoint.json
function getAllSnowLight(datas, msg) {
  datas.forEach(data => getSnowLightRequest(data.endpoint, msg, data.name));
}

// return a specific light status for a given request and associate a name to it.
function getSnowLightRequest(req, msg, name) {
  axios.get(req)
    .then(response => parseResponse(response, name.toUpperCase(), msg))
    .catch(error => {
      console.log(error);
    });
}

// parse response from API endpoint
function parseResponse(response, name, msg) {
  const data = {
    id: response.data.features[0].attributes.STATION_NO,
    name,
    status: response.data.features[0].attributes.STATUT,
    stationnement: response.data.features[0].attributes.STATIONNEMENT,
    lastUpdated: parseDate(response.data.features[0].attributes.DateMiseJour),
  };
  if (msg && msg.channel) {
    msg.channel.send(
      `${data.name} : ${data.status} - ${data.stationnement},
      Last updated: ${data.lastUpdated},
      Light ID: ${data.id}`
    );
  }
  return data;
}

// parse date from timestamp
function parseDate(date) {
  return new Date(date).toLocaleString();
}

// show help commands
function getHelp(datas, msg) {
  let help = '';
  datas.forEach(data => help += `${data.name} : ${data.desc} \n`);
  msg.channel.send(help);
}