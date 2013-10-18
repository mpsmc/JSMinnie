var request = require('request');
var S = require('string');
var cheerio = require('cheerio');

module.exports = function(client, config) {
	var UD_REGEX = /^!ud (.+)/i;

	client.addListener('message', function (from, to, message) {
		var match = UD_REGEX.exec(message);

		if(match !== null) {
			ud(from, to, match[1]);
		}
	});

	function ud(from, to, subject) {
		request({uri:'http://www.urbandictionary.com/define.php?term=' + encodeURIComponent(subject)}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(body);
				var definition = $("div.definition").eq(0).text();
				var example = $("div.example").eq(0).text();
				client.say(to, from + ": " + definition);
				if(example) {
					client.say(to, "An example is: " + example);
				}
			}else{
				if(!error)
					client.say(to, from + ": " + subject + " not found on UD!");
				else
					client.say(to, from + ": UD Error " + (error ? error : ""));
			}
		})
	}
}
