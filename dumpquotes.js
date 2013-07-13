var ejdb = require('ejdb');
var jb = ejdb.open('minnie_db');

var cursor = jb.find('tell');
var objs = [];
while(cursor.next()) {
	var obj = cursor.object();
	obj.to = obj.to.toLowerCase();
	obj.channel = obj.channel.toLowerCase();
	objs.push(obj);
}

jb.save('tell', objs, function(err, uids) { if(err) console.log("ERR", err); } );
console.log(objs);
