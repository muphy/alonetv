var mongoose = require('mongoose');

// { pic: 'http://graph.facebook.com/586604844775754/picture?type=square',
//   username: 'Kim  Janie',
//   userId: 'facebook_586604844775754',
//   text: 'ㅁㅁ',
//   ext: { type: 'chat' },
//   date: '2015-07-19T15:05:55.159Z' }
  // channel : {
    //       name: $stateParams.programName,
    //       id: channelName,
    //       programName: programName
    //     }
var MessageSchema = new mongoose.Schema({
	username: String,
	userId: String,
	text: String,
	id: String,
	date: Date,
	createDate: Date,
	channel: {
		name: String,
		id: String,
		programName: String
	}
});

module.exports = mongoose.model('Message', MessageSchema);