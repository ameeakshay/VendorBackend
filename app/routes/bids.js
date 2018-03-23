var express = require('express');
var bidRouter = express.Router();

var bids = require('../controllers/bidController.js');
var common = require('../common/common.js');

bidRouter.post('/bid', common.isLoggedIn, bids.add_bid);
bidRouter.put('/bid', common.isLoggedIn, bids.update_bid);
bidRouter.get('/bids/:status', common.isLoggedIn, bids.get_bids);

module.exports = bidRouter;