/**
 * test faye websocket performance
 * websocket-bench -a 200 -c 40 -w 4 -t faye ws://localhost:8888/faye -g generator.js
 * websocket-bench -a 200 -c 40 -w 4 -t faye ws://128.199.139.107:8888/faye -g generator.js
 * https://github.com/M6Web/websocket-bench
 * Usage: websocket-bench [options] <server>

	Options:
	
	-h, --help               Output usage information
	-V, --version            Output the version number
	-a, --amount <n>         Total number of persistent connection, Default to 100
	-c, --concurency <n>     Concurent connection per second, Default to 20
	-w, --worker <n>         Number of worker(s)
	-g, --generator <file>   Js file for generate message or special event
	-m, --message <n>        Number of message for a client. Default to 0
	-o, --output <output>    Output file
	-t, --type <type>        Type of websocket server to bench(socket.io, engine.io, faye, primus, wamp). Default to socket.io
	-p, --transport <type>   Type of transport to websocket(engine.io, websockets, browserchannel, sockjs, socket.io). Default to websockets (Just for Primus)
	-k, --keep-alive         Keep alive connection
	-v, --verbose            Verbose Logging
 */
var numCPUs = require('os').cpus().length;
console.log(numCPUs);
module.exports = {
	/**
	 * Before connection (optional, just for faye)
	 * @param {client} client connection
	 */
	channelId: '/P633515761_1440039600000',
	scheduleId: "P633515761",
	channelName: '두기',
	beforeConnect: function (client) {
		// Example:
		// client.setHeader('Authorization', 'OAuth abcd-1234');
		// client.disable('websocket');
	},

	/**
	 * On client connection (required)
	 * @param {client} client connection
	 * @param {done} callback function(err) {}
	 */
	onConnect: function (client, done) {
		// Faye client
		client.subscribe(this.channelId, function (message) {
			console.log(message);
		});
		this.sendMessage(client, function () {
			console.log('success for sending message')
		});
		// Socket.io client
		// client.emit('test', { hello: 'world' });

		// Primus client
		// client.write('Sailing the seas of cheese');

		// WAMP session
		// client.subscribe('com.myapp.hello').then(function(args) { });

		done();
	},

	/**
	 * Send a message (required)
	 * @param {client} client connection
	 * @param {done} callback function(err) {}
	 */
	sendMessage: function (client, done) {
		// Example:
		// client.emit('test', { hello: 'world' });
		var message = {
			pic: "http://graph.facebook.com/10206616561829722/picture?type=square",
			username: "Oh Jong Am",
			userId: "facebook_10206616561829722",
			text: "hello",
			type: "chat",
			isChat: true,
			date: "2015-08-20T02:07:11.471Z",
			channel: {
				name: this.channelName,
				id: this.channelId,
				scheduleId: this.scheduleId
			}
		};

		client.publish(this.channelId, message);
		console.log('message');
		// client.call('com.myapp.add2', [2, 3]).then(function (res) { });
		done();
	},

	/**
	 * WAMP connection options
	 */
	options: {
		// realm: 'chat'
	}
};