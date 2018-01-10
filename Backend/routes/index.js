var express = require('express');
var router = express.Router();
var Task = require('../models/tasks');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  Task.getAllTasks(function(err,rows){
 
  res.json(rows);
 
 });
});

module.exports = router;
