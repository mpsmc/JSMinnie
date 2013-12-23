var mathjs = require('mathjs'),
	request = require('request'),
	util = require('util'),
    math = mathjs({
    	notation: 'fixed'
    });
	
var Unit = math.type.Unit;
var BASE_UNITS = Unit.BASE_UNITS;
var UNITS = Unit.UNITS;
var PREFIXES = Unit.PREFIXES;

PREFIXES.CURRENCY = JSON.parse(JSON.stringify(PREFIXES.LONG)); // bite me
for(var key in PREFIXES.CURRENCY) {
	PREFIXES.CURRENCY[key].scientific = false;
}

BASE_UNITS.CURRENCY = {};

var CURRENCIES = {
	'usd': {names: ['usd', 'dollar'], precision: 2},
	'btc': {names: ['btc', 'bitcoin'], precision: 7},
	'eur': {names: ['eur', 'euro'], precision: 2},
	'gbp': {names: ['gbp'], precision: 2}
};

Object.keys(CURRENCIES).forEach(function(key) {
	var currency = CURRENCIES[key];
	var names = currency.names;
	var precision = currency.precision;
	CURRENCIES[key] = null;
	var value = 0;

	for(var i = 0; i < names.length; i++) {
		names[i] = {
			name: names[i],
			base: BASE_UNITS.CURRENCY,
			prefixes: PREFIXES.CURRENCY,
			value: 0,
			offset: 0,
			precision: precision
		};

		UNITS.push(names[i]);
	}

	Object.defineProperty(CURRENCIES, key, {
		set: function(newValue) {
			value = newValue;

			for(var i = 0; i < names.length; i++) {
				names[i].value = value;
			}
		},
		get: function() {
			return {
				value: value,
				names: names
			};
		}
	});
});

CURRENCIES.btc = 1;

function updateCurrencies(cb) {
	request('https://blockchain.info/ticker', function(error, response, body) {
		var resp = JSON.parse(body);
		for(var key in resp) {
			if(CURRENCIES[key.toLowerCase()] != null) {
				CURRENCIES[key.toLowerCase()] = 1 / resp[key]['15m'];
			}
		}

		cb();
	});
}
	
module.exports = function(client, config, jb) {
	var MATH_REGEX = /^!math (.+)/i;
	
	client.addListener('message', function(from, to, message) {
		var match = MATH_REGEX.exec(message);		
		if(match == null) return;

		var asyncTasks = 0;
		var finishTask = function() {
			asyncTasks--;
			if(asyncTasks <= 0) {
				handleMessage(from, to, match);
			}
		}

		var containsCurrency = false;
	
		for(var key in CURRENCIES) {
			CURRENCIES[key].names.forEach(function(v) {
				if(message.indexOf(v.name) != -1) containsCurrency = true;
			})
		}

		if(containsCurrency) {
			asyncTasks++;
			updateCurrencies(finishTask);
		}
		
		if(asyncTasks == 0) {
			finishTask();
		}
	});
	
	function handleMessage(from, to, match) {
		var result;
		
		var query = match[1];
		query = query.replace(/\bto\b/i, "in");
		query = query.replace(/\bfeet\b/i, "foot");
		
		query = query.replace(/\bf\b/i, "fahrenheit");
		query = query.replace(/\bc\b/i, "celsius");
		query = query.replace(/\bliter\b/i, "litre");
		query = query.replace(/\blbs\b/i, "lbm");
		query = query.replace(/\bpounds?\b/i, "poundmass");
		
		
		try {
			result = math.eval(query);
		}catch(e) {
			result = e;
		}

		if(result && result.unit && result.unit.precision) {
			result = result.format({notation: 'fixed', precision: result.unit.precision});
		}
		
		if(typeof result == 'function') {
			result = "That's a function!";
		}
		
		client.say(to, from + ": " + result);
	}
}