var irc = require('irc');
var fs = require('fs');
var S = require('string');
var EJDB = require("ejdb");

var config = require(process.cwd() + '/config');

var client = new irc.Client(config.server, config.nick, config);

client.addListener('error', function(message) {
	console.log('error: ', message);
});

client.addListener('netError', function(message) {
	console.log('netError: ', message);
});

var jb = EJDB.open("minnie_db", EJDB.DEFAULT_OPEN_MODE);

// Load in the modules
fs.readdirSync(__dirname + "/modules").forEach(function(file) {
	var name = file.substr(0, file.indexOf('.'));
	console.log("Loading module " + name);
	require('./modules/' + name)(client, config, jb);
});
