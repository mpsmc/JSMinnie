var fs = require('fs');

module.exports = function(client, config) {
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
		if(to != "#minichan-minecraft") return;
		var match = TOPIC_REGEX.exec(message);

		if(match !== null) {
			if(match[1] != null && match[1] > 0 && match[1] <= topics.length) {
				var topic = topics[match[1] - 1];
				client.say(to, "Topic " + match[1] + " by " + topic.nick + ": " + topic.topic);
			}else{
				var topic = topics[topics.length - 2];
				if(topic == null) {
					client.say(to, "No topics before current");
				}else{
					client.say(to, "Previous topic (" + (topics.length - 1) + ") by " + topic.nick + ": " + topic.topic);
				}
			}
		}
	});

	client.addListener('topic', function (channel, topic, nick, message) {
		if(channel != "#minichan-minecraft") return;
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