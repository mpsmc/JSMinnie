var irc = require('irc');
var fs = require('fs');
var S = require('string');
var EJDB = require("ejdb");

require('traceur').require.makeDefault();

var config = require(process.cwd() + '/config');

var client = new irc.Client(config.server, config.nick, config);

client.allReturns = function allReturns(fn) {
	return function() {
		var args = arguments;
		var cb = args[args.length - 1];
		args[args.length - 1] = function() {
			cb.apply(this, [arguments[0], Array.prototype.slice.call(arguments, 1)]);
		};

		return fn.apply(this, args);
	};
}

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
