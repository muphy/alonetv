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
  Program.find(function (err, programs) {
    if (err) return next(err);
    var currentTime = Date.now();
    var list = _.pick(programs, function (e, i) {
      return currentTime >= e.beginTime && currentTime <= e.endTime;
    });
    res.json(list);
  });
});

module.exports = router;
