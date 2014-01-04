module.exports = function (client, config, jb) {
	return;
	client.modes = {};
	
	var mapping = {
		'o': '@',
		'v': '+'
	};
	
	function modechange(func, channel, by, mode, who, message) {
		if(!client.modes[channel]) client.modes[channel] = {};
		var channelModes = client.modes[channel];
		if(!mapping[mode]) return;
		mode = mapping[mode];
		func(channel, channelModes, mode, who);
	}
	
	client.addListener('+mode', modechange.bind(null, function(channel, modes, mode, who) {
		if(mode == '+' && modes[who] == '@') return;
		modes[who] = mode;
		
		console.log(modes);
	}));
	
	client.addListener('-mode', modechange.bind(null, function(channel, modes, mode, who) {
		if(modes[who] == mode) modes[who] = '';
		
		console.log(modes);
	}));
	
	client.addListener('names', function(channel, users) {
		console.log(users);
		client.modes[channel] = users;
	});
};