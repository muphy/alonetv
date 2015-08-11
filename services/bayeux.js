
var User = require('../models/User');
var Message = require('../models/Message');
var Program = require('../models/Program');
var logger = require('tracer').console();

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

	var clients = {};
	bayeux.on('handshake', function (client_id) {
		logger.log(util.format('[handshake] - client:%s', client_id));
	});
	bayeux.on('subscribe', function (client_id, channel) {
		logger.log(util.format('[subscribe] - client:%s, channel:%s', client_id, channel));
	});
	bayeux.on('unsubscribe', function (client_id, channel) {
		logger.log(util.format('[unsubscribe] - client:%s, channel:%s', client_id, channel));
		logger.log("---------------------");
		// logger.log('clients',clients);
		// var userId = clients[client_id].userId;
		if (clients[client_id]) {
			var userId = clients[client_id].userId;
			logger.log('userId', userId);
			User.findById(userId, function (err, user) {
				if (user) {
					var exit_message = {
						pic: user.imgurl,
						username: user.name,
						userId: user.userId,
						text: user.name + " 님께서 나가셨습니다.",
						ext: {
							type: 'exit'
						}
					};
					logger.log('exit_message', exit_message);
					bayeux.getClient().publish(channel, exit_message);
					var channelInfo = channel.split('_');
					Program.where({ scheduleId: channelInfo[0].substring(1), beginTime: channelInfo[1] })
						.update({ $dec: { members: 1 } }, function () { });
				}
			})

		}
	});
	bayeux.on('publish', function (client_id, channel, data) {
		logger.log(util.format('[publish] - client:%s, channel:%s', client_id, channel));
		logger.log("[publish] - data");
		if (data.ext && data.ext.type == 'chat') {
			var message = new Message(data);
			message.save(function (err) {
				if (err) logger.log(err);
				else logger.log('success');
			});
		}
		logger.log(data);
	});
	bayeux.on('disconnect', function (client_id) {
		logger.log(util.format('[disconnect] - client:%s', client_id));
		delete clients[client_id];
	});


	var authExtention = {
		// clients: {},
		incoming: function (message, callback) {
			// logger.log('incoming', message);
			var channel = message.channel;
			if (channel == "/meta/subscribe") {
				var userId = message.ext.userId;
				logger.log('incoming===>', JSON.stringify(message));
				User.findById(userId, function (err, user) {
					if (user) {
						// logger.log('user'+user);
						if (!message.ext) message.ext = {};
						message.ext.userName = user.name;
						clients[message.clientId] = {
							userId: userId
						}
						message.ext.type = 'join';
						bayeux.getClient().publish(message.subscription, message);
						var channelInfo = message.subscription.split('_');
						Program.where({ scheduleId: channelInfo[0].substring(1), beginTime: channelInfo[1] })
							.update({ $inc: { members: 1 } }, function () { });

					}
					callback(message);
				})
			} else {
				callback(message);
			}

		},
		outgoing: function (message, callback) {
			// logger.log('outgoing', message);
			// logger.log('message.ext' + message.ext);
			callback(message);
		}
	};
	bayeux.addExtension(authExtention);
	return bayeux;
}


