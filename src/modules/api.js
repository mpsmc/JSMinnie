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
			var target = query.target;
			if(!target && query.staff) target = "+##minichan";
			if(!target) target = "##minichan";
			
			if(query.notice)
				client.notice(target, query.msg);
			else
				client.say(target, query.msg);
			
			res.end("OK");
		}else{
			res.end("Unknown call");
		}
	});
	
	server.listen(8080, '0.0.0.0');
};