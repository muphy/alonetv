
module.exports.Bayeux = function(server) {
	var util = require('util');
	var faye = require('faye');
	var fayeRedis = require('faye-redis');
	var bayeux = new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45,
		engine: {
			type: fayeRedis,
			host: 'localhost',
			port: 6379
		}
	});

	bayeux.attach(server);

	bayeux.on('handshake', function (client_id) {
		console.log(util.format('[handshake] - client:%s', client_id));
	});
	bayeux.on('subscribe', function (client_id, channel) {
		console.log(util.format('[subscribe] - client:%s, channel:%s', client_id, channel));
	});
	bayeux.on('unsubscribe', function (client_id, channel) {
		console.log(util.format('[unsubscribe] - client:%s, channel:%s', client_id, channel));
	});
	bayeux.on('publish', function (client_id, channel, data) {
		console.log(util.format('[publish] - client:%s, channel:%s', client_id, channel));
		console.log("[publish] - data");
		console.log(data);
	});
	bayeux.on('disconnect', function (client_id) {
		console.log(util.format('[disconnect] - client:%s', client_id));
	});
	return bayeux;
}


