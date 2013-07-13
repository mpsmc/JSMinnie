module.exports = function(client, config, jb) {
	client.addListener('message', function (from, to, message) {
		if(to.indexOf("#") !== 0) return;
		var match = /^minnie.?\s+(?:(?:in|after)\s+(\d+)\s*([a-z]+))?\s*(tell|ask)\s+([^ ]+)\s(.+)/i.exec(message);

		checkForMessages(from, to);

		if(match !== null) {
			var when = new Date();
			if(match[1]) {
				var minutes = match[1];
				var multiplier = match[2].replace(/s$/, '');

				if(multiplier == "hour")
					multiplier = 60;
				else if(multiplier == "minute")
					multiplier = 1;
				else if(multiplier == "day")
					multiplier = 60 * 24;
				else {
					client.say(to, from + ": Wtf is a " + match[2] + "?");
					return
				}

				when.setMinutes(when.getMinutes() + minutes * multiplier);
			}

			var target = match[4];

			var tell = {
				message: message,
				to: target.toLowerCase(),
				from: from,
				when: when,
				channel: to.toLowerCase()
			};

			jb.save("tell", tell, function(err, oids) {
				if(err) {
					client.say(to, "Error: " + err);
					return;
				}

				client.say(to, from + ": I'll pass that on when " + target + " is around.");
			});
		}
	});

	var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ];

	function checkForMessages(from, to) {
		jb.find("tell", {
			channel: to.toLowerCase(),
			to: from.toLowerCase(),
			when: {'$lt': new Date()},
			'$dropall': true
		}, function(err, cursor) {
			while(cursor.next()) {
				var obj = cursor.object();
				var now = new Date();
				var then = obj.when;

				var time = pad2(then.getUTCHours()) + ":" + pad2(then.getUTCMinutes()) + "Z";

				if(then.getUTCDay() != now.getUTCDay()
					|| then.getUTCMonth() != now.getUTCMonth()
					|| then.getUTCFullYear() != now.getUTCFullYear()) {
					time = then.getUTCDate() + " " + monthNames[then.getUTCMonth()] + " " + time;
				}

				client.say(obj.channel, from + ": " + time + " <" + obj.from + "> " + obj.message);
			}
		});
	}
};

function pad2(number) {
     return (number < 10 ? '0' : '') + number  
}
