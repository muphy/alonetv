var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* create new user. */
router.post('/', function(req, res, next) {
  var newUser = new User(req.body);
  newUser.save(function(err) {
    if(err) {
      console.log('error:'+err);
    } else {
      console.log('success');
    }
  });
  res.json(200,req.body);
});

module.exports = router;
