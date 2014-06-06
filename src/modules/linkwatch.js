var request = require('request').defaults({
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36'
	}
});

var cheerio = require('cheerio');
var rurl = require('url');

module.exports = function(client, config) {
	var linkCache = {};

	setInterval(function() {
		var now = Date.now();
		for(var key in linkCache) {
			var entry = linkCache[key];
			if(now - entry.time > 60 * 1000) {
				delete linkCache[key];
			}
		};
	}, 30 * 1000);

	var URL_REGEX = /(?:https?:\/\/)?[\-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([\-a-zA-Z0-9@:%_+.~#?&\/\/=]*)/ig;
	client.addListener('message', function (from, to, message) {
		if(from.toLowerCase() == 'minnie') return;

		var urls = message.match(URL_REGEX);
		if(urls != null) {
			var messages = [];
			var counter = 0;
			var cb = function(err, message) {
				if(!err)
					messages.push(message);
				else
					console.error(err);

				counter++;
				if(counter == urls.length && messages.length > 0) {
					var message = '';
					for(var i = 0; i < messages.length; i++) {
						message += '[' + (i+1) + '] ' + messages[i] + ' ';
					}

					client.say(to, message);
				}
			}

			urls.forEach(function(url) { urlHandler(url, cb) });
		}
	});

	function urlHandler(url, cb) {
		if(!url.match(/^https?:\/\//i)) {
			url = 'http://' + url;
		}

		var parsed = rurl.parse(url);
		if(parsed.hostname == '127.0.0.1' || parsed.hostname == 'localhost') return cb(null, 'Invalid');

		if(linkCache[url])
			return;

		linkCache[url] = {
			time: Date.now()
		};

		request.head(url, function(err, res, body) {
			if(err) return cb(err);

			if(res.statusCode != 200) {
				return cb(null, res.statusCode);
			}

			var ct = res.headers['content-type'];
			if(!ct || ct.match(/^text\/html/i)) {
				return htmlHandler(url, cb);
			}else if(ct.match(/^image\/gif/i)) {
				return mediacrush(url, cb);
			}else{
				return cb('Unknown content type: ' + ct);
			}
		});
	}

	function mediacrush(url, cb) {
		request.post('https://mediacru.sh/api/upload/url', {form: {url: url}}, function(err, res, body) {
			if(res.statusCode == 200 || res.statusCode == 409) {
				var r = JSON.parse(body);
				cb(null, 'https://mediacru.sh/' + r.hash + '/direct');
			}else{
				console.error("mediacrush statuscode " + res.statusCode + " " + body);
				cb(null, 'http://gfycat.com/fetch/' + url);
			}
		});
	}

	function htmlHandler(url, cb) {
		request(url, function(err, res, body) {
			if(err) return cb(err);

			try {
				var $ = cheerio.load(body);
				var title = $('head title');

				if(title == null) return cb(null, 'No title');
				title = title.text().trim();
				if(title.length == 0) return cb(null, 'No title');
				return cb(null, title);
			}catch(err2) {
				return cb(err2);
			}
		});
	}
}