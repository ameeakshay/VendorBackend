var express = require('express');
var profileRouter = express.Router();

var profile_update = require('../controllers/profileController.js');
var common = require('../common/common.js');

profileRouter.get('/basic_details', common.isLoggedIn, profile_update.get_basic_details)
profileRouter.put('/basic_details', common.isLoggedIn, profile_update.update_basic_details)
profileRouter.get('/business_details', common.isLoggedIn, profile_update.get_business_details)
profileRouter.put('/business_details', common.isLoggedIn, profile_update.update_business_details)

module.exports = profileRouter;