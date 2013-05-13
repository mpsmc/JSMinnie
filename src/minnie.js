var irc = require('irc');
var fs = require('fs');
var S = require('string');

var config = require('./config');

var client = new irc.Client(config.server, config.nick, config);

client.addListener('error', function(message) {
	console.error('error: ', message);
});

client.addListener('netError', function(message) {
	console.error('netERror: ', message);
});

// Load in the modules
fs.readdirSync(__dirname + "/modules").forEach(function(file) {
	var name = file.substr(0, file.indexOf('.'));
	require('./modules/' + name)(client, config);
});