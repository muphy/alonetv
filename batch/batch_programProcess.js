var programReader = require('../test/programReader');
var schedule = require('node-schedule');

var rule1 = new schedule.RecurrenceRule();
rule1.dayOfWeek = [0, new schedule.Range(0, 6)];
rule1.hour = 0;
rule1.minute = 28;
var programOfTodaySaverJob = schedule.scheduleJob(rule1, function () {
    programReader.process();
});


var rule2 = new schedule.RecurrenceRule();
rule2.dayOfWeek = [0, new schedule.Range(0, 6)];
rule2.hour = 0;
rule2.minute = 30;
var programOfTodaySaverJob = schedule.scheduleJob(rule2, function () {
    programReader.process();
});


var rule3 = new schedule.RecurrenceRule();
rule3.dayOfWeek = [0, new schedule.Range(0, 6)];
rule3.hour = 0;
rule3.minute = 32;
var programOfTodaySaverJob = schedule.scheduleJob(rule3, function () {
    var option = {
        locationToSave: 'mongodb',
        justCurrentProgram: false,
        isTomorrow: true
    };
    programReader.process(option);
});

var rule4 = new schedule.RecurrenceRule();
rule4.dayOfWeek = [0, new schedule.Range(0, 6)];
rule4.hour = 0;
rule4.minute = 34;
var programOfTodaySaverJob = schedule.scheduleJob(rule4, function () {
    var option = {
        locationToSave: 'mongodb',
        justCurrentProgram: false,
        isTomorrow: true
    };
    programReader.process(option);
});