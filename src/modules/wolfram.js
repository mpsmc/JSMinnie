var googl = require('goo.gl');
var wait = require('wait.for-es6');

function nodeGoogl(longUrl, cb) {
	googl.shorten(longUrl, function(shortUrl) {
		cb(null, shortUrl);
	});
}

module.exports = function(client, config, jb) {
	var wolfram = require('wolfram-alpha').createClient(config.wolfram);
	
	client.addListener('message', function (from, to, message) {
		if(to.indexOf("#") !== 0) return;
		var match = /^!wolfram:? (.+)/i.exec(message);

		var say = function(msg) {
			client.say(to, from + ": " + msg);
		}

		if(match !== null) {
			wolfram.query(match[1], function(err, rs) {
				if(err) {
					console.error(err);
					return say(err);
				}

				wait.launchFiber(handleWolfram, rs);				
			});
		}

		function* handleWolfram(rs) {
			if(rs != null && rs.length === 1 && rs[0].primary && rs[0].subpods[0].image) {
				return say(rs[0].subpods[0].image);
			}

			if(rs === null || rs.length <= 1) {
				return say('I dunno man...');
			}

			console.log(require('util').inspect(rs, { showHidden: true, depth: null }));

			// first result is interpretation
			var res = rs[0].subpods[0].text.trim();

			// second one is usually the most important one
			for (var i = 0; i < rs[1].subpods.length; i += 1) {
				var pod = rs[1].subpods[i];

				var img = yield [ nodeGoogl, pod.image ];
				res += '\n' + img.id;
				if(pod.text) res += ' (' + pod.text.trim().replace(/^\(|\)$/g, "") + ')';
			}

			// keep answer on one line if it's a simple answer (interpretation + ans)
			if (res.split('\n').length === 2) {
				say(res.split('\n').join(' => '));
			} else {
				say(res);
			}
		}
	});
};