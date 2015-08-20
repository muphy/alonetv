var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Message = require('../models/Message.js');
var _ = require('underscore');

/* GET /programs  current programs list. */
router.get('/:scheduleid', function (req, res, next) {
  var scheduleId = req.params.scheduleid;
  var callback = function (err, list) {
    if (err) return next(err);
    res.json(list);
  };
  Message.find({ 'channel.scheduleId': scheduleId }).sort({date:-1})
    .limit(20).
    exec(callback);
});

module.exports = router;
