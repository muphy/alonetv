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
  Program.find({ "beginTime": { $lt: currentTime }, "endTime": { $gt: currentTime } }, function (err, list) {
    if (err) return next(err);
    res.json(list);
  });
});

module.exports = router;
