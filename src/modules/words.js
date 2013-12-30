var async = require('async')

var wordregexp = /^\w+/;
var wordtrim = /^[^\w]+/;

var randomParts = [
	["", "Gazooks! ", "Congrats! ", "Hey, ", "Yo! ", "Jesus christ, ", "God damn... "],
	["u ", "you "],
	["got ", "have spoken ", "said ", "just said ", "blabbered ", "uttered "],
	["for the "],
	["time "],
	["ITC", "in this channel", "here"],
	["...", "!", "!!!"]
];

module.exports = function(client, config, jb) {
	return;
	var q = async.queue(function(task, cb) {
		jb.findOne('words', {word: task.word}, function(err, obj) {
			if(err) {
				console.error(err);
				return cb();
			}

			if(obj != null) {
				task.count += obj.count;
			}

			console.log(task.word + ": " + task.count);

			jb.update('words', {
				word: task.word,
				'$upsert': {word: task.word, count: task.count}
			}, function(err) {
				if(err)
					console.error(err);
				else{
					if(task.count / 1000 % 1 === 0) {
						sendCongrats(task);
					}
				}

				cb();
			})
		});
	}, 1);

	function randomPart(index) {
		var parts = randomParts[index];
		var num = Math.floor(Math.random() * parts.length);
		return parts[num];
	}

	function sendCongrats(task) {
		client.say('##minichan', 
			randomPart(0) +
			task.from + " " +
			randomPart(1) +
			randomPart(2) +
			"'" + task.word + "' " +
			randomPart(3) +
			task.count + "th " +
			randomPart(4) +
			randomPart(5) +
			randomPart(6)
		);
	}


	client.addListener('message', function (from, to, message) {
		if(to != "##minichan") return;

		var wordsArr = message.split(" ");
		var words = {};

		for(var i = 0; i < wordsArr.length; i++) {
			var word = wordsArr[i].trim().replace(wordtrim, "");
			if(!word)
				continue;

			var match = wordregexp.exec(word);
			if(match != null) {
				word = match[0];
			}

			if(!word)
				continue;

			if(!words[word])
				words[word] = 1;
			else
				words[word]++;
		}

		for(var key in words) {
			q.push({word: key, count: words[key], from: from});
		}
	});
};