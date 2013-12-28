module.exports = function(client, config, jb) {
	var REPLACE_REGEX = /^s\/(.+)\/(.+?)\/?$/i;
	var lastMessages = {};
	
	client.addListener('message', function (from, to, message) {
		var match = REPLACE_REGEX.exec(message);		
		if(match == null) {
			lastMessages[from] = message;
			return;
		}
		
		try {
			var result;
			var regexp = new RegExp(match[1], 'i');
			
			var lastMessage = lastMessages[from];
			if(lastMessage == null) lastMessage = "";
			lastMessage = lastMessage.replace(regexp, match[2]);
			lastMessages[from] = lastMessage;
			
			client.say(to, from + ": " + lastMessage);
		}catch(e) {
			return client.say(to, "You suck at regexp " + from + " (" + e + ")!");
		}
	});
}