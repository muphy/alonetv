
var User = require('../models/User');

module.exports.Bayeux = function (server) {
	var conf = require('../conf');
	var util = require('util');
	var faye = require('faye');
	var fayeRedis = require('faye-redis');
	var bayeux = new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45,
		engine: {
			type: fayeRedis,
			host: conf.redisHost,
			port: conf.redisPort
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


	var authExtention = {
		clients: {},
		incoming: function (message, callback) {
			var self = this;
			console.log('incoming', message);
			var channel = message.channel;
			if (channel == "/meta/subscribe") {
				var userId = message.ext.userId;
				User.findById(userId, function (err, user) {
					if (user) {
						// console.log('user'+user);
						if (!message.ext) message.ext = {};
						message.ext.userName = user.name;
						self.clients[message.clientId] = bayeux.getClient();
						message.ext.type = 'join';
						console.log('subscription:' + message.subscription);
						self.clients[message.clientId].publish(message.subscription, message);
					}
					callback(message);
				})
			}  else {
				callback(message);
			}

		},
		outgoing: function (message, callback) {
			// console.log('outgoing', message);
			// console.log('message.ext' + message.ext);
			callback(message);
		}
	};
	bayeux.addExtension(authExtention);
	return bayeux;
}


