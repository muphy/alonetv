
var User = require('../models/User');
var Message = require('../models/Message');
var Program = require('../models/Program');
var Participant = require('../models/Participant');
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

    var lobby_channel = '/lobby';
	bayeux.attach(server);

	bayeux.on('handshake', function (client_id) {
		logger.log(util.format('[handshake] - client:%s', client_id));
	});
	bayeux.on('subscribe', function (client_id, channel) {
		logger.log(util.format('[subscribe] - client:%s, channel:%s', client_id, channel));
		if (/lobby/.test(channel)) return;
		var channelInfo = channel.split('_');
		var queryParam = { scheduleId: channelInfo[0].substring(1), beginTime: Number(channelInfo[1]) };
		logger.log('queryParam=>', queryParam);
		var updateMemberCtn = Program.update(queryParam, { $inc: { members: 1 } })
			.limit(1).exec();
		var programResult = updateMemberCtn.then(function (result) {
			logger.log('update result', result);
			return Program.findOne(queryParam, 'scheduleId members').exec();
		});
		programResult.then(function (program) {
			//TODO
			//get last message and fill in the message;
			logger.log('program', program);
			var message = {
				program: program
			}
			logger.log('lobby_channel', lobby_channel);
			bayeux.getClient().publish(lobby_channel, JSON.stringify(message));
		});
	});
	bayeux.on('unsubscribe', function (client_id, channel) {
		logger.log(util.format('[unsubscribe] - client:%s, channel:%s', client_id, channel));
		if (/lobby/.test(channel)) return;
		var channelInfo = channel.split('_');
		var queryParam = { scheduleId: channelInfo[0].substring(1), beginTime: Number(channelInfo[1]) };
		logger.log('queryParam=>', queryParam);
		var updateMemberCtn = Program.update(queryParam, { $inc: { members: -1 } })
			.limit(1).exec();
		var programResult = updateMemberCtn.then(function (result) {
			logger.log('update result', result);
			return Program.findOne(queryParam, 'scheduleId members').exec();
		});
		programResult.then(function (program) {
			//TODO
			//get last message and fill in the message;
			logger.log('program', program);
			var message = {
				program: program
			}
			logger.log('lobby_channel', lobby_channel);
			bayeux.getClient().publish(lobby_channel, JSON.stringify(message));
		});

	});
	bayeux.on('publish', function (client_id, channel, data) {
		logger.log(util.format('[publish] - client_id:%s, channel:%s', client_id, channel));
		logger.log("[publish] - data", data);
		try {
			if (data.type == 'chat') {
				var message = new Message(data);
				data.createDate = new Date();
				message.save(function (err) {
					if (err) logger.log(err);
					else logger.log('success');
				});
			} else {
				var query = { scheduleId: data.scheduleId, userId: data.userId };
				if (data.type == 'join') {
					Participant.findOne(query, function (err, participant) {
						if (participant) {
							var update = { $set: { 
										     status: true, 
											 joinDate: new Date() 
										   } };
							Participant.update(query, update,function(result) {
								logger.log('join result',result);
							});
						} else {
							var participant = new Participant(data);
							participant.status = true;
							participant.scheduleId = data.scheduleId;
							participant.joinDate = new Date();
							participant.save(function (err) {
								if (err) logger.log(err);
								else logger.log('success');
							});
						}
					});
				} else if (data.type == 'exit') {
					Participant.findOne(query, function (err, participant) {
						if (participant) {
							var update = { $set: { 
										     status: false, 
											 exitDate: new Date() 
										   } };
							Participant.update(query, update,function(result) {
								logger.log('exit result',result);
							});
						}
					});
				}
			}

		} catch (err) {
			console.log('publish error', err);
		}
		
		// logger.log(data);
	});
	bayeux.on('disconnect', function (client_id) {
		logger.log(util.format('[disconnect] - client:%s', client_id));
	});


	var authExtention = {
		incoming: function (message, callback) {
			callback(message);
		},
		outgoing: function (message, callback) {
			// logger.log('outgoing', message);
			// logger.log('message' + message);
			callback(message);
		}
	};
	bayeux.addExtension(authExtention);

	return bayeux;
}


