var programReader = require('./programReader');
var utils = require('../utils/utils.js')
console.log(utils.today());
var option = {
	locationToSave: 'mongodb',
	justCurrentProgram: false,
	isTomorrow: false
};
programReader.process(option);