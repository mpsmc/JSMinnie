var async = require('async');
var S = require('string');

var wordregexp = /^\w+/;
var wordtrim = /^[^\w]+/;
var wait = require('wait.for-es6');

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
	var WORDBAN_REGEX = /^!(?:wordban|banword) (\w+)/i;
	var WORDCOUNT_REGEX = /^!wordcount (\w+)/i;

	function randomPart(index) {
		var parts = randomParts[index];
		var num = Math.floor(Math.random() * parts.length);
		return parts[num];
	}

	function sendCongrats(from, word, count) {
		// Sends congractulations to a user, stringing together a bunch of random parts of a sentence
		client.say('##minichan',
			randomPart(0) +
			from + " " +
			randomPart(1) +
			randomPart(2) +
			"'" + word + "' " +
			randomPart(3) +
			count + "th " +
			randomPart(4) +
			randomPart(5) +
			randomPart(6)
		);
	}

	function checkPrivileges(who, cb) {
		client.whois(who, function(info) {
			if (!info || !info.channels) return;
			for (var i = 0; i < info.channels.length; i++) {
				var channel = S(info.channels[i]);
				if (channel.endsWith('##minichan')) {
					if (channel.startsWith('+') || channel.startsWith('@')) {
						cb();
					} else {
						cb('Check your privileges.');
					}
				}
			}
		});
	}

	client.addListener('message', wait.launchFiber.bind(wait, handleMessage));

	function * handleMessage(from, to, message) {
		try {
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

			for (var key in words) {
				var word = key;
				var count = words[word];
				var hitCount = 0;
				var banned = false;

				var obj = yield[jb.findOne.bind(jb), 'words', {
					word: word
				}];
				// obj == null if this is the first time the word is spoken
				// count can also not be set if the word has been banned but never spoken
				if (obj != null && obj.count) {
					// add the previous count to our current count
					count += obj.count;
				}

				hitCount = 0;
				if (obj && obj.hitCount)
					hitCount = obj.hitCount;

				if (obj != null && obj.banned) {
					banned = obj.banned;

					var secondsPassedSinceBan = ((new Date()).getTime() - obj.banned) / 1000;

					if (hitCount >= 5) {
						banned = false;
						hitCount = 0;
					} else {
						hitCount++;
						client.say('##minichan', from + ": " + "You said \"" + word + "\" which is a banned word.");
					}

				}

				//console.log(word + ": " + count + " (" + (obj ? obj.banned : '-') + ")");

				// update or create the record in the database with the new count
				yield[jb.update.bind(jb), 'words', {
					word: word,
					'$upsert': {
						word: word,
						count: count,
						hitCount: hitCount,
						banned: banned
					}
				}];

				if (count / 1000 % 1 === 0) {
					sendCongrats(from, word, count);
				}
			}

			var wordBanMatch = WORDBAN_REGEX.exec(message);

			if (wordBanMatch != null) {
				yield[checkPrivileges, from];

				var bannedWord = wordBanMatch[1].toLowerCase();

				var obj = yield[jb.update.bind(jb), 'words', {
					word: bannedWord,
					'$upsert': {
						word: bannedWord,
						banned: new Date()
					}
				}];

				client.say(to, from + ": " + bannedWord + " is now banned!");
			}

			var wordCountMatch = WORDCOUNT_REGEX.exec(message);
			if (wordCountMatch != null) {
				var obj = yield[jb.findOne.bind(jb), 'words', {
					word: wordCountMatch[1].toLowerCase()
				}];
				if (obj != null) {
					client.say(to, from + ": " + wordCountMatch[1] + " has been said " + obj.count + " times!");
				}
			}
		} catch (e) {
			client.say(to, from + ": " + e);
		}
	};
};