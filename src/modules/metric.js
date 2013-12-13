var mathjs = require('mathjs'),
    math = mathjs();

module.exports = function(client, config, jb) {
	var MATH_REGEX = /^!math (.+)/i;
	
	client.addListener('message', function (from, to, message) {
		var match = MATH_REGEX.exec(message);		
		if(match == null) return;
		
		var result;
		
		var query = match[1];
		query = query.replace(/\bto\b/, "in");
		query = query.replace(/\bfeet\b/, "foot");
		
		
		try {
			result = math.eval(query);
		}catch(e) {
			result = e;
		}
		
		if(typeof result == 'function') {
			result = "That's a function!";
		}
		
		client.say(to, from + ": " + result);
	});
}