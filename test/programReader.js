var Promise = require("bluebird");
var util = require('util');
var needle = require('needle');
var _ = require('underscore');
var fs = require('fs');
var programSaver = require('./programSaver');
var utils = require('../utils/utils.js')
var cheerio = require('cheerio');
var request = require('request');
var rp = require('request-promise');
var s = require("underscore.string");
var winston = require('winston');

winston.level = 'debug';

winston.log('info', 'program reader process started.');
winston.add(winston.transports.File, { filename: '../../batch.log' });

function URLs(isTomorrow) {
    var PROGRAME_BASE_URL = 'http://tvguide.naver.com/program/multiChannel.nhn?';
    var urlFormatterList = [PROGRAME_BASE_URL + 'broadcastType=100&date=%s', PROGRAME_BASE_URL + 'broadcastType=500&channelGroup=46&date=%s',
        PROGRAME_BASE_URL + 'broadcastType=200&channelGroup=13&date=%s'
    ];
    var URLs = _.map(urlFormatterList, function (urlFormat) {
        return util.format(urlFormat, isTomorrow ? utils.tomorrow() : utils.today());
    });
    // console.log(URLs);
    return URLs;
}

var doJob = function(options) {
    var option = options || {
        locationToSave: 'mongodb',
        justCurrentProgram: false,
        isTomorrow: false
    };
    winston.log('info','option:'+JSON.stringify(option));
    var locationToSave = option.locationToSave; //or 'file' || 'mongodb'
    var justCurrentProgram = option.justCurrentProgram; // if true, just fetch current programs.
    var trashChannels = ['채널 A', 'MBN', 'TV 조선', '채널A', 'OBS 경인TV', '경인 KBS1', 'QTV', 'MBC every1', 'MBC Music', 'XTM', 'E채널',
        'KBS WORLD', 'K STAR', 'SBS MTV', 'SBS funE', 'FX', '코미디TV', 'KBS Joy', 'I.NET', '월드이벤트TV', 'CMC 가족오락TV', 'Sky ENT', 'GMTV', '가요TV', 'etn 연예채널', 'CH W'];
    Promise.promisifyAll(needle);
    var current = Promise.resolve();
    var request_options = {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36",
        }
    };
    Promise.map(URLs(option.isTomorrow), function (URL) {
        // console.log(URL);
        current = current.then(function () {
            return needle.getAsync(URL, request_options);
        });
        return current;
    }).map(function (responseAndBody) {
        var b = responseAndBody[1].match(/PROGRAM_SCHEDULES=[\s\S]*?;/gm);
        var strSchedule = b[0].replace('PROGRAM_SCHEDULES=', '').replace(';', '');
        var result = JSON.parse(strSchedule);
        return result;
    }).then(function (results) {
        var myChannelList = _.values(results);
        var myProgramList = [];

        _.each(myChannelList, function (channel, i) {
            var channelList = channel.channelList;
            _.each(channelList, function (channel) {
                var channelInfo = {
                    broadcastName: channel.broadcastName,
                    channelName: channel.channelName
                };
                var programList = channel.programList;
                _.each(programList, function (program) {
                    var convertedProgram = convertProgramDate(program);
                    convertedProgram = _.extend(convertedProgram, channelInfo);
                    myProgramList.push(convertedProgram);
                });
            });

        });
        // console.log(myProgramList);
        return _.reject(myProgramList, function (program, i) {
            return _.contains(trashChannels, program.channelName);
        });
        // return myProgramList;
    }).then(function (results) {
        var list = _.values(results);
        list = _.uniq(list, function (e, i) {
            return e.scheduleId;
        });
        if (justCurrentProgram) {
            var currentTime = Date.now();
            list = _.each(list, function (e, i) {
                return currentTime >= e.beginTime && currentTime <= e.endTime;
            });
        }
        if (locationToSave === 'file') {// or 'mongdb'
            // writeToFile("result.json", JSON.stringify(_.values(list)));
            fs.writeFile("result111.json", JSON.stringify(_.values(list)), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
        } else {
            programSaver.saveProgramsToMongo(list);
        }
        // console.log(list);
        return _.map(list, function (e) {
            // console.log(e);
            return {
                scheduleName: _.propertyOf(e)('scheduleName'),
                channelName: _.propertyOf(e)('channelName'),
                scheduleId: _.propertyOf(e)('scheduleId')
            };
        });
    }).then(function (scheduleNames) {
        var pageUrls = _.map(scheduleNames, function (schedule) {
            return thumbnailCollector.programPageUrl(schedule.scheduleName);
        });

        var promiseList = [];
        _.each(pageUrls, function (pageUrl, i) {
            var requestOptions = {
                url: pageUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36",
                }
            };
            // console.log(pageUrl);
            var rp1 = rp(requestOptions).then(function (res) {
                return res;
            });
            promiseList.push(rp1);
        });

        Promise.all(promiseList)
            .then(function (result) {
            // var responses = _.values(result);
            var list = [];
            var count = 0;
            _.mapObject(result, function (body, key) {
                var schedule = scheduleNames[count];
                // console.log(schedule);
                var imgUrl = thumbnailCollector.getImgUrl(schedule, body) || 'https://s3-ap-northeast-1.amazonaws.com/infinispanping/infinispan-cluster/139.jpg';
                list.push({
                    scheduleId: schedule.scheduleId, imgUrl: imgUrl
                });
                count = count + 1;
            });
            return list;
        }).then(function (list) {
            console.log(list);
            thumbnailCollector.updateProgramThumbToMongo(list);
        }).catch(function (e) {
            console.log(e);
        });
    });
}

module.exports.process = doJob;

module.exports.convertProgramDate = function (program) {
    var beginTime = util.format('%s %s', program.beginDate, program.beginTime);
    var endTime = util.format('%s %s', program.beginDate, program.endTime);
    var beginTimeN = Date.parse(beginTime);
    var endTimeN = Date.parse(endTime);
    // console.log(endTime);
    if (beginTimeN > endTimeN) {
        endTimeN = endTimeN + 1000 * 60 * 60 * 24;
    }
    program.beginTime = beginTimeN;
    program.endTime = endTimeN;
    return program;
};

var thumbnailCollector = {
    programPageUrl: function (scheduleName) {
        var urlFormat = 'http://movie.daum.net/search.do?type=tv&q=%s';
        if (scheduleName.indexOf("무한") > 0) {
            urlFormat = urlFormat + '&bweek=NNNNNYN'; //Y is a mark of the day that can watch show.
        }
        return util.format(urlFormat, encodeURIComponent(scheduleName.replace(' ', '+')));
    },
    getImgUrl: function (schedule, responseAndBody) {
        var $ = cheerio.load(responseAndBody);
        // var scheduleName = schedule.scheduleName;
        // var channelName = schedule.channelName;
       
        var imgUrl = $('#s_mv > div > dl > dt > a > img').attr('src');
        // console.log(imgUrl);
        return imgUrl;
    },
    updateProgramThumbToMongo: function (list) {
        programSaver.updateProgramThumbToMongo(list);
    }
};

