var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
var url = 'mongodb://128.199.248.88:27017/lynda';
var _ = require('underscore');


var savePrograms = function (db, list, callback) {
	var collection = db.collection('programs');
	var opsList = [];
	_.each(list,function(program) {
		var ops = { updateOne: { 
			filter: { scheduleId: program.scheduleId, beginTime: program.beginTime }, 
			update: { $set: program }, 
			upsert: true } 
		};
		opsList.push(ops);
	});
	collection.bulkWrite(opsList,{ordered:true, w:1},function(err,r) {
		if(err) {
			console.log(err);
		} else {
			console.log(r.insertedCount);
		}
		callback();
	})
};


var updateProgramThumbImg = function (db, list, callback) {
	var collection = db.collection('programs');
	// console.log(list);
	var opsList = [];
	_.each(list,function(program) {
		var ops = { updateOne: { 
			filter: { scheduleId: program.scheduleId }, 
			update: { $set: { 'thumbImg': program.imgUrl } }, 
			upsert: false } 
		};
		opsList.push(ops);
	});
	collection.bulkWrite(opsList,{ordered:true, w:1},function(err,r) {
		if(err) {
			console.log(err);
		} else {
			console.log(r.insertedCount);
		}
		callback();
	})
};

function updateProgramThumbToMongo(list) {
	MongoClient.connect(url, function (err, db) {
		// assert.equal(null, err);
		console.log("Connected correctly to server");
		updateProgramThumbImg(db, list, function () {
			db.close();
		});
	});
}

function saveProgramsToMongo(list) {
	MongoClient.connect(url, function (err, db) {
		// assert.equal(null, err);
		console.log("Connected correctly to server");
		savePrograms(db, list, function () {
			db.close();
		});
	});
}
module.exports.saveProgramsToMongo = saveProgramsToMongo;
module.exports.updateProgramThumbToMongo = updateProgramThumbToMongo;