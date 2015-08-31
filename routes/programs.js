var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Program = require('../models/Program.js');
var _ = require('underscore');

/* GET /programs  current programs list. */
router.get('/', function (req, res, next) {
  Program.find(function (err, programs) {
    if (err) return next(err);
    res.json(programs);
  });
});

/* GET /programs/current current programs list. */
router.get('/current', function (req, res, next) {
  var currentTime = Date.now();
  var callback = function (err, list) {
    if (err) return next(err);
    res.json(list);
  };
  Program.find({ "beginTime": { $lt: currentTime }, "endTime": { $gt: currentTime } })
    .sort({ _id: -1 })
    .exec(callback);
});

router.get('/previous/:hour', function (req, res, next) {
  var hour = Number(req.params.hour);
  var baseTime = hour*60*60*1000; //2 hour
  var previousTime = Date.now()-baseTime;
  
  var callback = function (err, list) {
    if (err) return next(err);
    res.json(list);
  };
  Program.find({ "beginTime": { $lt: previousTime }, "endTime": { $gt: previousTime } } )
    .sort({ _id: -1 })
    .exec(callback);
});

module.exports = router;
