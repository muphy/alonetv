var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	provider: String,
	email: String,
	first_name: String,
	gender: String,
	id: String,
	last_name: String,
	link: String,
	locale: String,
	middle_name: String,
	name: String,
	timezone: Number,
	updated_time: String,
	verified: Boolean
});

module.exports = mongoose.model('User', UserSchema);