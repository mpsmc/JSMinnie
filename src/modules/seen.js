var wait = require('wait.for-es6');
var moment = require('moment');

module.exports = function(client, config, jb) {
	client.addListener('message', wait.launchFiber.bind(wait, function* (from, to, message) {
		if(to.indexOf("#") !== 0) return;
		var match = /^!nseen (.+)/i.exec(message);

		if(match !== null) {
			match[1] = match[1].trim();
			var seen = yield [ jb.findOne.bind(jb), 'seen', { who: {'$icase': match[1]} } ];
			var result = null;

			if(seen == null) {
				result = "I do not know who " + match[1] + " is. Sorry!";
			}else{
				var meta = seen.meta;
				result = seen.who + " was last seen " + moment(seen.when).fromNow() + ", ";

				switch(seen.what) {
					case "nick":
						result += "changing their name " + meta.tofrom + " " + meta.nick;
						break;
					case "msg":
						result += "speaking in " + seen.where + (message.msg ? " (" + meta.msg + ")" : "");
						break;
					case "join":
						result += "joining " + seen.where;
						break;
					case "quit":
						result += "quitting IRC" + (meta.msg ? " (" + meta.msg + ")" : "");
						break;
					case "part":
						result += "parting " + seen.where + (meta.msg ? " (" + meta.msg + ")" : "");
						break;
					default:
						result += seen.what;
				}
			}

			if(result == null)
				result = "I do not know what to say to that.";

			client.say(to, from + ": " + result);
		}

		storeEvent('msg', from, to, {msg: message});
	}));

	client.addListener('join', function(channel, nick, message) {
		storeEvent('join', nick, channel);
	});

	client.addListener('part', function(channel, nick, reason, message) {
		storeEvent('part', nick, channel, {msg: reason});
	});

	client.addListener('quit', function(nick, reason, channels, message) {
		storeEvent('quit', nick, '', {msg: message});
	});

	client.addListener('nick', function(oldnick, newnick, channels, message) {
		storeEvent('nick', oldnick, '', {tofrom: 'to', nick: newnick});
		storeEvent('nick', newnick, '', {tofrom: 'from', nick: oldnick});
	});

	function storeEvent(what, who, where, meta) {
		jb.update('seen', {
			who: who,
			'$upsert': {
				what: what,
				who: who,
				where: where,
				meta: meta,
				when: new Date()
			}
		}, function(err, res) {
			if(err) {
				console.error(err);
			}
		});
	}
};