var CleverBot = new require('cleverbot-node');
var clever = new CleverBot();

module.exports = function(client, config, jb) {
	client.addListener('message', function (from, to, message) {
		if(to.indexOf("#") !== 0) return;
		var match = /^!cb:? (.+)/i.exec(message);

		if(match !== null) {
			clever.write(match[1], function(data) {
				console.log(data);
				client.say(to, from + ": " + data.message);
			});
		}
	});
};