// app/routes.js

//load bcrypt
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = (app, models) => {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    var Client = models.client;
    var Vendor = models.vendor;

    var ResponseFormat = function() {
        this.status = '',
        this.message = '',
        this.data = ''
    };


    var generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    var isValidPassword = function(userpass, password) {
        return bCrypt.compareSync(password, userpass);
    };

    app.get('/', (req, res) => {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', (req, res) => {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', (req, res, next) => {

        var temp = new ResponseFormat();

        var User;

        if (req.body.type == 'client') {
            console.log('client');

            User = Client;
        }
        else if (req.body.type == 'vendor'){
            console.log('vendor');
        
            User = Vendor;
        }

        User.findOne({where: { email: req.body.username }}).then(function(user) {

            if (!user) {
                temp.status = 401;
                temp.message = 'Authentication Failed. User not found!';
                temp.data = null;

                res.status(temp.status)
                    .json(temp);
            }

            else if (user) {
                
                if (!isValidPassword(user.password, req.body.password)) { 
                    temp.status = 401;
                    temp.message = 'Authentication Failed. Password Incorrect!';
                    temp.data = null; 

                     res.status(temp.status)
                        .json(temp);
                }
                else {
                    return res.json({token: jwt.sign({ email: user.email, id: user.id, type: req.body.type }, 'ClientVendor')});
                }
            }
        })
    });


    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', (req, res) => {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the login form
    app.post('/signup', (req, res, next) => {

        var temp = new ResponseFormat();

        var User;

        if (req.body.type == 'client') {
            console.log('client');

            User = Client;
        }
        else if (req.body.type == 'vendor'){
            console.log('vendor');
        
            User = Vendor;
        }

        User.findOne({ where: { email: req.body.username }}).then(function(user) {

            if (user)
            {
                temp.status = 200;
                temp.message = 'User already exists.';
                temp.data = null;

                res.status(temp.status)
                    .json(temp);
            } 
            else {

                var userPassword = generateHash(req.body.password);
                const random_id = crypto.randomBytes(16).toString('hex');
                console.log(random_id);

                var data = {
                    id: random_id, 
                    email: req.body.username,
                    password: userPassword
                };

                User.create(data).then(function(newUser) {
                    
                    if (!newUser) {
                        temp.status = 200;
                        temp.message = 'Unable to create the user.'
                        temp.data = null;
                    }

                    if (newUser) {
                        temp.status = 200;
                        temp.message = 'User created Successfully.'
                        temp.data = newUser;
                    }

                    res.status(temp.status)
                        .json(temp);
                });
            }
        }); 
    });

    
    // =====================================
    // PROFILE SECTION =========================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, ({ user }, res) => {
        // res.render('profile.ejs', {
        //     user, // get the user out of session and pass to template
        // });
        // res.send(user);
        console.log("This is the data to be displayed");
        console.log(user);
    });

    //Route to get all the Main Categories
    app.get('/main_categories', isLoggedIn, (req, res) => {

        var temp = new ResponseFormat();
        var MainCategory = models.main_category;

        MainCategory.findAll().then(function(mainCategories) {
                
            temp.status = 200;

            if (!mainCategories.length) {
                temp.message = 'No Main Categories Found';
                temp.data = [];    
            }
            else { 
                temp.message = 'All the Main Categories';
                temp.data = mainCategories;   
            }

            res.status(temp.status)
                .json(temp);
        })
    });


    //Route to create a main category...this will only be used by developers and Admin
    app.post('/main_categories', function(req, res) {

        var temp = new ResponseFormat();

        var MainCategory = models.main_category;

            var data = {
                name: req.body.name
            };

            MainCategory.create(data).then(function(mainCategory) {

                if (mainCategory) {
                    temp.status = 201;
                    temp.message = 'Successfully created the categorY';
                    temp.data = mainCategory;
                }
                else {
                    temp.status = 409;
                    temp.message = 'Unable to create the category';
                    temp.data = [];
                }

                res.status(temp.status)
                    .json(temp);
            });
    });
    //Route to get all the Sub Categories associated with a Main Category
    app.get('/sub_categories/:id', isLoggedIn, function(req, res) {

        var temp = new ResponseFormat();
        var SubCategory = models.sub_category;

        SubCategory.findAll({where: {mainCategoryId : req.params.id}}).then(function(subCategories) {

            temp.status = 200;
            
            if (!subCategories.length) {
                temp.message = 'No Sub Categories Found';
                temp.data = [];
            }
            else {
                temp.message = 'Sub categories corresponding to Main Category #' + req.params.id;
                temp.data = subCategories;   
            }

            res.status(temp.status)
                .json(temp);
        })
    });

    //Route to create sub categories for a main category...for Developers and Admin usage only
    app.post('/sub_categories', function(req, res) {

        var temp = new ResponseFormat();
        var SubCategory = models.sub_category;

        var data = {
                name: req.body.name,
                mainCategoryId: req.body.mainCategoryId
            };

        SubCategory.create(data).then(function(subCategory) {

            if (subCategory) {
                    temp.status = 201;
                    temp.message = 'Successfully created the sub category';
                    temp.data = subCategory;
                }
                else {
                    temp.status = 409;
                    temp.message = 'Unable to create the sub category';
                    temp.data = [];
                }

                res.status(temp.status)
                    .json(temp);
        })
    });

    app.post('/tender', isLoggedIn, function(req, res) {

        var temp = new ResponseFormat();

        var Tender = models.tender;

        if (req.user.id && req.body.duration && req.body.quantity && req.body.subCategoryId) {

            console.log("Client:  " + req.user.id + " is posting a Tender. " + "Duration: " + req.body.duration + " Quantity: " + req.body.quantity + " SubCategory: " + req.body.subCategoryId);

            var tenderData = {
                tenderEnds: req.body.duration,
                quantity: req.body.quantity,
                clientId: req.user.id,
                subCategoryId: req.body.subCategoryId
            };

            Tender.create(tenderData).then(function(newTender) {

                if (newTender) {
                    temp.status = 201;
                    temp.message = 'Successfully created the Tender';
                    temp.data = newTender;
                }
                else {
                    temp.status = 409;
                    temp.message = 'Unable to create the Tender';
                    temp.data = [];
                }

                res.status(temp.status)
                    .json(temp);
            });
        }
        else
        {
            temp.status = 403;
            temp.message = 'Client needs to be logged in to post a Tender';
            temp.data = null;

            res.status(temp.status)
                .json(temp);
        }
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/client_tenders', isLoggedIn, function(req, res) {

        var temp = new ResponseFormat();

        var Tender = models.tender;

        if (req.user.id) {

            Tender.findAll({where: {clientId: req.user.id}}).then(function(clientTenders) {

                if (clientTenders.length) {
                    temp.status = 200;
                    temp.message = 'Retreived all Tenders for Client ' + req.user.id;
                    temp.data = clientTenders;
                }
                else {
                    temp.status = 200;
                    temp.message = 'Unable to find Tenders posted by Client ' + req.user.id;
                    temp.data = null;
                }
                
                res.status(temp.status)
                    .json(temp);
            })
        }
        else
        {
            temp.status = 403;
            temp.message = 'Client needs to be logged in to retrieve all the Tenders';
            temp.data = null;
                
            res.status(temp.status)
                .json(temp);
        }
    });

    app.get('/tenders_main_category', function(req, res) {

        var temp = new ResponseFormat();

        var Tender = models.tender;
        var SubCategory = models.sub_category;

        var mainCategoryIds = req.query.mainCategoryId;

        if (!Array.isArray(req.query.mainCategoryId)){
            mainCategoryIds = Array.from(req.query.mainCategoryId);
        }   

        Tender.findAll({
            include: [{
                model: models.sub_category,
                where: {mainCategoryId: {in: mainCategoryIds}}
            }]
        }).then(function(tenders) {
            
            temp.status = 200;
                
            if (tenders.length) {
                temp.message = 'Tenders associated with the requested Main Categories';
                temp.data = tenders;
            }
            else {
                temp.message = 'No tenders for the requested Main Categories';
                temp.data = null;
            }

            res.status(temp.status)
                .json(temp);
        });
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.user) return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
