var express = require('express');
var tenderRouter = express.Router();

var tenders = require('../controllers/tenderController.js');
var common = require('../common/common.js');

tenderRouter.post('/tender', common.isLoggedIn, tenders.add_tender)
tenderRouter.get('/tender/:tenderId', common.isLoggedIn, tenders.get_tender)
tenderRouter.get('/client_tenders', common.isLoggedIn, tenders.get_client_tenders)
tenderRouter.get('/tenders_main_category', common.isLoggedIn, tenders.get_main_category_tenders)
tenderRouter.get('/tender_bids/:tenderId', common.isLoggedIn, tenders.get_all_bids)

module.exports = tenderRouter;