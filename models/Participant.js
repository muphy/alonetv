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
var Participant = new mongoose.Schema({
	username: String,
	pic:String,
	userId: String,
	id: String,
	date: { type: Date, default: Date.now },
	joinDate: { type: Date, default: Date.now },
	exitDate: { type: Date, default: Date.now },
	scheduleId: String,
	status: Boolean,
	channel: {
		name: String,
		id: String,
		scheduleId: String
	}
});
Participant.index({date:-1})

module.exports = mongoose.model('Participant', Participant);