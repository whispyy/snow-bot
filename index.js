const Discord = require('discord.js');
const axios = require('axios');

const endpoints = require('./endpoint.json');
const keep_alive = require('./keep_alive.js');
const SnowAlert = require('./snow_alert.js');

const client = new Discord.Client();
const token = process.env.DISCORD_BOT_SECRET;
const alert = new SnowAlert();

client.on('ready', () => {
  console.log(`Connected as: ${client.user.username}`);
});

client.on('message', msg => {
  if (msg.content[0] == '!' && msg.author.id != client.user.id) {
    let args = msg.content.substring(1).split(' ');
    let cmd = args[0];
    args = args.splice(1);
    alert.setMessage(msg);
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
        if(args[0] && args[0] == 'on') {
          msg.channel.send('Turning on automatic alert');
          return alert.startPoller();
        }
        if (!args[0] || args[0] && args[0] == 'off') {
          msg.channel.send('Turning off automatic alert');
          return alert.stopPoller();
        }
        break;
      case 'snow':
        const API = endpoints.endpoints;
        if (!args[0] || args[0] && args[0] == 'all') {
          msg.channel.send('__État des feux :__');
          getAllSnowLight(API, msg);
        }
        if (args[0] && args[0] !== 'all') {
          getSnowLightName(args[0], API, msg);
        }
        break;
    }
  }
});

client.login(token);

// search light status for a specific name
function getSnowLightName(name, datas, msg) {
  const data = datas.find(data => data.name === name);
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
function getSnowLightRequest(req, msg, customName) {
  axios.get(req)
    .then(response => {
      const data = parseResponse(response, customName);
      msg.channel.send(
        `${data.customName} : ${data.status} - ${data.stationnement},
        Last updated: ${data.lastUpdated},
        Light ID: ${data.id}`
      );

    }).catch(error => {
      console.log(error);
    });
}

// parse response from API endpoint
function parseResponse(response, customName) {
  // console.log(response.data.features[0].attributes);
  return {
    id: response.data.features[0].attributes.STATION_NO,
    customName,
    status: response.data.features[0].attributes.STATUT,
    stationnement: response.data.features[0].attributes.STATIONNEMENT,
    lastUpdated: parseDate(response.data.features[0].attributes.DateMiseJour),
  };
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