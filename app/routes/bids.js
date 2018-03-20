var express = require('express');
var bidRouter = express.Router();

var bids = require('../controllers/bidController.js');
var common = require('../common/common.js');

bidRouter.post('/add_bid', common.isLoggedIn, bids.add_bid);

module.exports = bidRouter;