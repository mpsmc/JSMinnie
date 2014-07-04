var http = require('http');
var qs = require('querystring');

module.exports = function(client, config, jb) {
	var server = http.createServer( function(req, res) {
		//if(req.url != '/'+config.wolfram) return res.end();
		if (req.method == 'POST') {
			var body = '';
			req.on('data', function (data) {
				body += data;
			});
			req.on('end', function () {
				var post = qs.parse(body);
				var text = post.text.split('\n')[0].replace("#WorldCup", "").replace(/#/g, "").replace(/Goal for ([\s\S]+?)!/ig, "GOOOOOOOOOOOOOOOOOOOOOAL! $1 scored!").trim();
				config.doMediacrush(post.gif, function(err, url) {
					var message = text + "! " + url + " (" + post.video + ")";
					client.say("##minichan", message);
				});
			});
			res.end('OK');
		} else {
			res.end('NOK');
		}
	});
	
	server.listen(12145, '0.0.0.0');
};