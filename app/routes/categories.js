var express = require('express');
var categoryRouter = express.Router();

var categories = require('../controllers/categoryController.js');
var common = require('../common/common.js');

categoryRouter.get('/main_categories', categories.get_main_categories)
categoryRouter.post('/main_categories', categories.add_main_category)
categoryRouter.get('/sub_categories/:id', categories.get_sub_categories)
categoryRouter.post('/sub_categories', categories.add_sub_category)

module.exports = categoryRouter;