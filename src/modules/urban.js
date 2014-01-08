var request = require('request');
var S = require('string');
var cheerio = require('cheerio');
var wait = require('wait.for-es6');

module.exports = function(client, config) {
	var UD_REGEX = /^!ud (.+)/i;

	client.addListener('message', function (from, to, message) {
		var match = UD_REGEX.exec(message);

		if(match !== null) {
			wait.launchFiber(ud, from, to, match[1]);
		}
	});

	function* ud(from, to, subject) {
		try {
			var [response, body] = yield [ client.allReturns(request), {uri:'http://www.urbandictionary.com/define.php?term=' + encodeURIComponent(subject)} ];
			if(response.statusCode != 200) throw new Error('Invalid status code: ' + response.statusCode);

			var $ = cheerio.load(body);
			var definition = $("div.definition").eq(0).text();
			var example = $("div.example").eq(0).text();
			client.say(to, from + ": " + definition);
			if(example) {
				client.say(to, "An example is: " + example);
			}
		}catch(e) {
			client.say(to, from + ": " + e);
		}
	}
}
