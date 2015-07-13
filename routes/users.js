var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/**
 * findOneAndUpdate emit wierd errors. => err: "After applying the update to the document
 */
// router.post('/', function (req, res, next) {
//   var newUser = new User(req.body);

//   var query = { 'provider': newUser.provider,'id':newUser.id };
//   // req.newData.username = req.user.username;
//   User.findOneAndUpdate(query, newUser, { upsert: true }, function (err, doc) {
//     if (err) return res.send(500, { error: err });
//     return res.json(200, req.body);
//   });
// });

/* create new user. */
router.post('/', function (req, res, next) {
  var newUser = new User(req.body);

  var query = { 'provider': newUser.provider, 'id': newUser.id };
  // req.newData.username = req.user.username;
  User.findOne(query, function (err, user) {
    if (err) return res.send(500, { error: err });
    if (!user) {
      var newUser = new User(req.body);
      newUser.save(function (err) {
        if (!err) {
          return res.json(200, user);
        } else {
          return res.json(500, { error: err });
        }
      });
    } else {
      return res.json(200, user);
    }
    
  });
});


module.exports = router;
