

module.exports = (app, models) => {

	var common = require('./common.js')
	var authentication = require('./authentication.js')(models, common)
	var categories = require('./categories.js')(models, common)
	var profile_update = require('./profile_update.js')(models, common)
	var tenders = require('./tenders.js')(models, common)

	app.post('/login', authentication.login)
	app.post('/signup', authentication.signup)
	app.get('/verification/:link/:token/:id', authentication.verify)

	app.get('/basic_details', common.isLoggedIn, profile_update.get_basic_details())
		.put('/basic_details', common.isLoggedIn, profile_update.update_basic_details())

	app.get('/business_details', common.isLoggedIn, profile_update.get_business_details())
		.put('/business_details', common.isLoggedIn, profile_update.update_business_details())

	app.post('/tender', common.isLoggedIn, tenders.add_tender())
	app.get('/client_tenders', common.isLoggedIn, tenders.get_client_tenders())
	app.get('/tenders_main_category', common.isLoggedIn, tenders.get_main_category_tenders())

	app.get('/main_categories', common.isLoggedIn, categories.get_main_categories())
		.post('/main_categories', categories.add_main_category())

	app.get('/sub_categories/:id', common.isLoggedIn, categories.get_sub_categories())
	app.post('/sub_categories', categories.add_sub_category())
}