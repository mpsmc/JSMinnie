var async = require('async');
var S = require('string');

var wait = require('wait.for-es6');

module.exports = function(client, config, jb) {
	var SCORE_REGEX = /^!score (\w+)/i;

	client.addListener('message', wait.launchFiber.bind(wait, handleMessage));

	function* handleMessage(from, to, message) {
		try {
			if (to != "##minichan") return;
			var modregexp = /(\w+)(\+\+|--)/g;
			var match = modregexp.exec(message);
			while (match != null) {
				var to = match[1].toLowerCase().trim();
				if(to == from) continue;
				var obj = yield[jb.findOne.bind(jb), 'score', {
					who: to
				}];
				var score = match[2] == "++" ? 1 : -1;
				if (obj != null && obj.score) {
					score += obj.score;
				}
				
				yield[jb.update.bind(jb), 'score', {
					who: to,
					'$upsert': {
						who: to,
						score: score
					}
				}];
				
				match = modregexp.exec(message);
			}
			
			match = SCORE_REGEX.exec(message);
			if(match != null) {
				var obj = yield[jb.findOne.bind(jb), 'score', {
					who: match[1].toLowerCase().trim()
				}];
				var score = 0;
				if(obj && obj.score) score = obj.score;
				
				client.say(to, from + ": " + match[1] + " has a score of " + score + "!");
			}
		} catch (e) {
			client.say(to, from + ": " + e);
		}
	};
};