var request = require('request');
var S = require('string');

module.exports = function(client, config) {
	var UD_REGEX = /!ud (.+)/i;

	client.addListener('message', function (from, to, message) {
		var match = UD_REGEX.exec(message);

		if(match !== null) {
			ud(from, to, match[1]);
		}
	});

	function ud(from, to, subject) {
		request({uri:'http://www.urbandictionary.com/define.php?term=' + encodeURIComponent(subject)}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(body);
			}else{
				client.say(to, from + ": UD Error " + error);
			}
		})
	}
}