var http = require('http');
var qs = require('querystring');
var urlparser = require('url');

module.exports = function(client, config, jb) {
	var server = http.createServer( function(req, res) {
		var url = urlparser.parse(req.url);
		var query;
		if(url.query) query = qs.parse(url.query);
		if(!query || query.secret != config.secret) return res.end();
		
		if(url.pathname == "/chat" && query.msg) {
			var targets = [];
			if(query.target) targets.push(query.target);
			
			if(targets.length == 0) {
				if(query.msg.indexOf("Topic \"") === 0) {
					targets.push("##minichan");
				}
				targets.push("##minichan-log");
				if(query.staff) {
					for(var i = 0; i < targets.length; i++) {
						targets[i] = "+" + targets[i];
					}
				}
			}
			
			for(var i = 0; i < targets.length; i++) {
				var target = targets[i];
				
				if(query.notice) {
					client.notice(target, query.msg);
				} else {
					client.say(target, query.msg);
				}
			}
			
			res.end("OK");
		}else{
			res.end("Unknown call");
		}
	});
	
	server.listen(8080, '0.0.0.0');
};