var async = require('async');
var S = require('string');

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

module.exports = function (client, config, jb) {
    var WORDBAN_REGEX = /^!(?:wordban|banword) (\w+)/i;

	var q = async.queue(function (task, cb) {
		jb.findOne('words', {
			word: task.word
		}, function (err, obj) {
			if (err) {
				console.error(err);
				return cb();
			}

			// obj == null if this is the first time the word is spoken
			// count can also not be set if the word has been banned but never spoken
			if (obj != null && obj.count) {
				// add the previous count to our current count
				task.count += obj.count;
			}

			task.hitCount = 0;
			if (obj && obj.hitCount)
				task.hitCount = obj.hitCount;

			if (obj != null && obj.banned) {
				task.banned = obj.banned;

				var secondsPassedSinceBan = ((new Date()).getTime() - obj.banned) / 1000;

				if (task.hitCount >= 5) {
					task.banned = false;
					task.hitCount = 0;
				} else {
					task.hitCount++;
					client.say('##minichan', task.from + ": " + "You said \"" + task.word + "\" which is a banned word.");
				}

			}

			console.log(task.word + ": " + task.count + " (" + (obj ? obj.banned : '-') + ")");

			// update or create the record in the database with the new count
			jb.update('words', {
				word: task.word,
				'$upsert': {
					word: task.word,
					count: task.count,
					hitCount: task.hitCount,
					banned: task.banned
				}
			}, function (err) {
				if (err)
					console.error(err);
				else { // check if the count is divisible by thousand, and if it is trigger sendCongrats
					if (task.count / 1000 % 1 === 0) {
						sendCongrats(task);
					}
				}

				cb();
			});
		});
	}, 1);

	function randomPart(index) {
		var parts = randomParts[index];
		var num = Math.floor(Math.random() * parts.length);
		return parts[num];
	}

	function sendCongrats(task) {
		// Sends congractulations to a user, stringing together a bunch of random parts of a sentence
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

	function handleBanWord(from, to, message) {
		var wordBanMatch = WORDBAN_REGEX.exec(message);

		if (wordBanMatch != null) {
			checkPrivileges(from, function() {
				var bannedWord = wordBanMatch[1].toLowerCase();

				jb.update('words', {
					word: bannedWord,
					'$upsert': {
						word: bannedWord,
						banned: new Date()
					}
				}, function (err, obj) {
					if (err) {
						console.error(err);
						client.say(to, from + ": " + err);
						return;
					}
	
					client.say(to, from + ": " + bannedWord + " is now banned!");
				});
			});
		}
	}
	
	function checkPrivileges(who, cb) {
		client.whois(who, function(info) {
			if(!info || !info.channels) return;
			for(var i = 0; i < info.channels.length; i++) {
				var channel = S(info.channels[i]);
				if(channel.endsWith('##minichan')) {
					if(channel.startsWith('+') || channel.startsWith('@')) {
						cb();
					}else{
						client.say('##minichan', who + ': Check your privileges.');
					}
				}
			}
		});
	}
	
	client.addListener('message', function (from, to, message) {
		if (to != "##minichan") return;

		var wordsArr = message.split(" ");
		var words = {};

		for (var i = 0; i < wordsArr.length; i++) {
			var word = wordsArr[i].toLowerCase().trim().replace(wordtrim, "");

			if (!word)
				continue;

			var match = wordregexp.exec(word);
			if (match != null) {
				word = match[0];
			}

			if (!word)
				continue;

			if (!words[word])
				words[word] = 1;
			else
				words[word]++;
		}

		var activeTasks = 0;

		for (var key in words) {
			// add a new task to q (the queue, which handles the messages sent to the database
			// one by one because they need to be in order)
			activeTasks++;
			q.push({
				word: key,
				count: words[key],
				from: from
			}, function () {
				activeTasks--;
				if (activeTasks == 0) {
					handleBanWord(from, to, message);
				}
			});
		}
	});
};