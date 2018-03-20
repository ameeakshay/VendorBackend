var express = require('express');
var tenderRouter = express.Router();

var tenders = require('../controllers/tenderController.js');
var common = require('../common/common.js');

tenderRouter.post('/tender', common.isLoggedIn, tenders.add_tender)
tenderRouter.get('/client_tenders', common.isLoggedIn, tenders.get_client_tenders)
tenderRouter.get('/tenders_main_category', common.isLoggedIn, tenders.get_main_category_tenders)

module.exports = tenderRouter;