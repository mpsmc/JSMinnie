var fs = require('fs');
var diff = require('simplediff');

function diffTopic(o, n) {
	if(!o) o = "";
	if(!n) n = "";

	var diffs = diff.stringDiff(o, n);
	var str = '\x0f';
	
	for(var i = 0; i < diffs.length; i++) {
		var d = diffs[i];
		if(d[0] == "+") {
			str += '\x0309';
		}else if(d[0] == "-") {
			str += '\x0304';
		}else{
			str += '\x0f';
		}
		
		for(var x = 0; x < d[1].length; x++) {
			str += d[1][x] + " ";
		}
	}
	
	return str;
}

module.exports = function(client, config) {
	console.log("Maybe?");
	var topics;
	var TOPIC_REGEX = /^!topic ?([0-9]+)?/i;

	if(fs.existsSync('topics.json')) {
		topics = JSON.parse(fs.readFileSync("topics.json"));

		topics.forEach(function(topic) {
			topic.date = new Date(topic.date);
		});
	}else{
		topics = [];
	}

	client.addListener('message', function (from, to, message) {
		console.log("what: " + to);
		if(to != "##minichan") return;
		var match = TOPIC_REGEX.exec(message);

		if(match !== null) {
			if(match[1] != null && match[1] > 0 && match[1] <= topics.length) {
				var topic = topics[match[1] - 1];
				var previous = topics[match[1] - 2] || {topic: ''};
				client.say(to, "Topic " + match[1] + " by " + topic.nick + ": " + diffTopic(previous.topic, topic.topic));
			}else{
				var topic = topics[topics.length - 1];
				if(topic == null) {
					client.say(to, "No topics before current");
				}else{
					var previous = topics[topics.length - 2] || {topic: ''};
					client.say(to, "Topic (" + (topics.length) + ") by " + topic.nick + ": " + diffTopic(previous.topic, topic.topic));
				}
			}
		}
	});

	client.addListener('topic', function (channel, topic, nick, message) {
		if(channel != "##minichan") return;
		if(topics.length != 0 && nick === 'henn') {
			client.send('topic', '##minichan', topics[topics.length - 1].topic);
			return;
		}
		if(topics.length === 0 || topic != topics[topics.length - 1].topic) {
			topics.push({topic: topic, nick: nick, channel: channel, date: new Date()});
			console.log(topics);
			saveTopics();
		}
	});

	var topicsTimeout = null;

	function saveTopics() {
		fs.writeFile("topics.json", JSON.stringify(topics), function(err) {
			if(err) {
				console.log(err);
				if(topicsTimeout != null) clearTimeout(topicsTimeout);
				topicsTimeout = setTimeout(saveTopics, 10000);
			}
		});
	}
};
