var request = require('request');
var S = require('string');


var mathjs = require('mathjs'),
    math = mathjs({
    	notation: 'fixed'
    });

module.exports = function (client, config) {
	var weatherRegex = /^!weather (.+)/i;

	client.addListener('message', function (from, to, message) {
		var match = weatherRegex.exec(message);

		if (match !== null) {
			try {
				weather(from, to, match[1]);
			}catch(e) {
				console.error(e);
				client.say(to, from + ": " + e);
			}
		}
	});

	function weather(from, to, subject) {
		request({
			uri: 'http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(subject)
		}, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);

				console.log(json);
				
				if(!json || !json.sys || !json.main || !json.weather) {
					client.say(to, from + ": " + subject + " is not recognized!");
					return;
				}
				
				var tempK = math.unit(json.main.temp, 'kelvin');
				var tempC = tempK.in('celsius').format({notation: 'fixed', precision: 1});
				var tempF = tempK.in('fahrenheit').format({notation: 'fixed', precision: 1});
				
				client.say(to, from + ": " + json.name + " " + json.sys.country + ", " + tempC + " (" + tempF + "), " + json.weather[0].description + ", Humidity: " + json.main.humidity + "%");
			} else {
				if (!error)
					client.say(to, from + ": " + subject + " not found.");
				else
					client.say(to, from + ": error");
			}
		})
	}
}