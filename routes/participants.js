var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Participant = require('../models/Participant.js');
var _ = require('underscore');

/* GET /programs  current programs list. */
router.get('/:scheduleid', function (req, res, next) {
  var scheduleId = req.params.scheduleid;
  var query = { 'scheduleId': scheduleId,status:true };
  console.log('query',query);
  var callback = function (err, list) {
    if (err) return next(err);
    res.json(list);
  };
  Participant.find({ 'scheduleId': scheduleId,status:true }).
    select('pic username link joinDate').
    limit(100).
    exec(callback);
});

module.exports = router;
