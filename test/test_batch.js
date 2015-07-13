//https://github.com/caolan/nodeunit

var util = require('util');
var programReader = require('./programReader');

function foo(istomorrow) {
    return istomorrow ? 'tomorrow' : 'today';
}
module.exports = {
    setUp: function (callback) {
        this.json = {
            "scheduleId": "C632741228",
            "programMasterId": "M514013925",
            "scheduleName": "문화빅뱅 윤건의 더 콘서트",
            "beginDate": "2015-05-20",
            "beginTime": "23:40",
            "endTime": "00:50",
            "runtime": 70,
            "largeGenreId": "G",
            "episodeNo": "",
            "live": false,
            "rebroadcast": false,
            "hd": false,
            "audio": "STEREO",
            "screenExplain": false,
            "caption": true,
            "ageRating": 0,
            "subtitle": "",
            "signLanguage": false
        };

        callback();
    },
    tearDown: function (callback) {
        // clean up
        callback();
    },
    test_empty_param: function (test) {
        test.equals(foo(true), 'tomorrow');
        test.equals(foo(), 'today');
        test.done();
    },
    test_process2: function (test) {
        var option = {
            locationToSave: 'mongodb',
            justCurrentProgram: false,
            isTomorrow: true
        };
        programReader.process(option);
        test.done();
    },
    test_connet_mongo: function (test) {
        // programReader.saveToMongo();
        
        test.done();
    }
    // test_convertTime: function(test) {
    //     var program = programReader.convertProgramDate(this.json);
    // 	test.equals(program.beginTime, 1432132800000);
    // 	test.equals(program.endTime, 1432137000000);
    //     test.done();
    // },
    // test_firebase: function(test) {
    // 	var fb = programReader.getFireBaseToken();
    // 	test.done();
    // }
};