var S = require('string');
var dns = require('dns');
var request = require('request');

module.exports = function(client, config) {
	var INVESTIGATE_REGEX = /minnie:? test ([a-z0-9_\-[\]\\^{}|`]*)/i;
	var webGateway = "gateway/web/freenode/ip.";

	client.addListener('message', function (from, to, message) {
		var match = INVESTIGATE_REGEX.exec(message);

		if(match !== null) {
			investigate(from, to, match[1], function(channel, message) {
				client.say(channel, message);
			});
		}
	});

	client.addListener('join', function(channel, nick, message) {
		investigate('Minnie', channel, nick, function() {});
	});

	function investigate(from, channel, subject, output) {
		if(client.chanData(channel).users[subject] != null) {
			client.whois(subject, function(info) {
				var host = info.host;
				if(S(host).startsWith(webGateway)) {
					host = S(host).chompLeft(webGateway).s;
				}

				if(S(host).contains("/")) {
					output(channel, subject + " is impervious to my probes!");
				}else{
					dns.lookup(host, 4, function(err, address, family) {
						if(err) {
							console.log(err);
							output(channel, "Error: " + err);
						}
						checkMinichan(from, channel, subject, address, output);
					});
				}
			});
		}else{
			output(channel, "I cannot find " + subject + "!");
		}
	}

	function checkMinichan(from, channel, subject, address, output) {
		request('http://minichan.org/Minnie/ip_info.php?secret=' + config.secret + '&ip=' + address, function (error, response, body) {
			if (error || response.statusCode != 200) {
				output(channel, "Could not connect home... " + ((error != null) ? error : ""));
			}else{
				var result = JSON.parse(body);

				if(result.names.length == 0) {
					output(channel, subject + ' is unknown to the board :(');
					return;
				}

				var message = subject + " is known as ";
				var first = true;
				var numPosts = 0;
				for(var name in result.names) {
					if(!first) message += ", ";
					message += name + " (" + result.names[name] + ")";
					numPosts += result.names[name];
					first = false;
				}

				message += " - http://minichan.org/IP_address/" + address;

				client.notice('+'+channel, message);

				if(numPosts < 100) {
					output(channel, subject + ' is kinda lame...');
				}else if(numPosts < 500) {
					output(channel, subject + ' is painfully average.');
				}else if(numPosts < 1000) {
					output(channel, subject + ' is a commoner.');
				}else if(numPosts < 3000) {
					output(channel, subject + ' is a prolific poster!');
				}else{
					output(channel, subject + ' is amazing!');
				}
			}
		});
	}
};