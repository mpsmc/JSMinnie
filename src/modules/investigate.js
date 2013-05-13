var S = require('string');
var dns = require('dns');
var request = require('request');

module.exports = function(client, config) {
	var INVESTIGATE_REGEX = /minnie:? test ([a-z_\-[\]\\^{}|`][a-z0-9_\-[\]\\^{}|`]*)/i;;
	var webGateway = "gateway/web/freenode/ip.";

	client.addListener('message', function (from, to, message) {
		var match = INVESTIGATE_REGEX.exec(message);

		if(match !== null) {
			investigate(from, to, match[1]);
		}
	});

	function investigate(from, channel, subject) {
		if(client.chanData(channel).users[subject] != null) {
			client.whois(subject, function(info) {
				var host = info.host;
				if(S(host).startsWith(webGateway)) {
					host = S(host).chompLeft(webGateway).s;
				}

				if(S(host).contains("/")) {
					client.say(channel, subject + " is impervious to my probes!");
				}else{
					dns.lookup(host, 4, function(err, address, family) {
						checkMinichan(from, channel, subject, address);
					});
				}
			});
		}else{
			client.say(channel, "I cannot find " + subject + "!");
		}
	}

	function checkMinichan(from, channel, subject, address) {
		request('http://minichan.org/Minnie/ip_info.php?secret=' + config.secret + '&ip=' + address, function (error, response, body) {
			if (error || response.statusCode != 200) {
				client.say(channel, "Could not connect home... " + ((error != null) ? error : ""));
			}else{
				var result = JSON.parse(body);

				var message = subject + " is known as ";
				var first = true;
				for(var name in result.names) {
					if(!first) message += ", ";
					message += name + " (" + result.names[name] + ")";
					first = false;
				}

				message += " - http://minichan.org/IP_address/" + address;

				client.notice('+'+channel, message);
			}
		});
	}
};