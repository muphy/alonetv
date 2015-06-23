var mongoose = require('mongoose');

var ProgramSchema = new mongoose.Schema({
	"scheduleId": String,
	"programMasterId": String,
	"scheduleName": String,
	"beginDate": String,
	"beginTime": Number,
	"endTime": Number,
	"runtime": Number,
	"largeGenreId": String,
	"episodeNo": String,
	"live": Boolean,
	"rebroadcast": Boolean,
	"hd": Boolean,
	"audio": String,
	"screenExplain": Boolean,
	"caption": Boolean,
	"ageRating": Number,
	"subtitle": String,
	"signLanguage": Boolean,
	"broadcastName": String,
	"channelName": String
});

module.exports = mongoose.model('Program', ProgramSchema);