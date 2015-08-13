
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

    var lobby_channel = '/lobby';
	bayeux.attach(server);

	bayeux.on('handshake', function (client_id) {
		logger.log(util.format('[handshake] - client:%s', client_id));
	});
	bayeux.on('subscribe', function (client_id, channel) {
		logger.log(util.format('[subscribe] - client:%s, channel:%s', client_id, channel));
		if(/lobby/.test(channel))return;
		var channelInfo = channel.split('_');
		var queryParam = {scheduleId: channelInfo[0].substring(1), beginTime: channelInfo[1]};
		logger.log(queryParam);
		var updateMemberCtn = Program.where(queryParam).update({ $inc: { members: 1 } }).exec();
		var programResult = updateMemberCtn.then(function(result) {
			var query = Program.findOne(queryParam);
				query.select('scheduleId members');
				return query.exec();
		});
		var sendingMessage = programResult.then(function(program) {
			//TODO
			//get last message and fill in the message;
			logger.log('program',program);
			var message = {
				program:program
			}
			bayeux.getClient().publish(lobby_channel, message);
		});
	});
	bayeux.on('unsubscribe', function (client_id, channel) {
		logger.log(util.format('[unsubscribe] - client:%s, channel:%s', client_id, channel));
		if(/lobby/.test(channel))return;
		var channelInfo = channel.split('_');
		var queryParam = {scheduleId: channelInfo[0].substring(1), beginTime: channelInfo[1]};
		var updateMemberCtn = Program.where(queryParam).update({ $inc: { members: -1 } }).exec();
		var programResult = updateMemberCtn.then(function(result) {
			var query = Program.findOne(queryParam);
				query.select('scheduleId members');
				return query.exec();
		});
		var sendingMessage = programResult.then(function(program) {
			//TODO
			//get last message and fill in the message;
			var message = {
				program:program
			}
			bayeux.getClient().publish(lobby_channel, message);
		});

	});
	bayeux.on('publish', function (client_id, channel, data) {
		logger.log(util.format('[publish] - client:%s, channel:%s', client_id, channel));
		logger.log("[publish] - data");
		if (data.type == 'chat') {
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


