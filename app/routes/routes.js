// app/routes.js

module.exports = (app, passport, models) => {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    var temp = {
        'status' : 500,
        'message' : '',
        'data' : ''
    };

    var bCrypt = require('bcrypt-nodejs');
    var randomstring = require('randomstring');

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

        passport.authenticate('local-login',  (err, user, info) => {
            console.log('hello');

            if (err) { return next(err); }

                if (!user){
                temp.message = 'Authentication Failed';
                temp.status = 401;
                temp.data = null;

                return res.status(temp.status).json(temp);
            }

            req.logIn(user, function(err) {

                if (err) { return next(err); }

                var Verify = models.verification;

                Verify.findOne({where: {id : user.id}}).then(function(verify) {
                
                        temp.status = 200;
                        console.log(verify);
                        if (verify.emailverified) {
                            temp.message = 'verified and logged in';
                            temp.data = user;    
                        }
                        else { 
                            temp.message = 'You are not verified, please verify your account.';
                            temp.data = verify;   
                        }

                });

                return res.status(temp.status).json(temp);
            });
        })(req, res, next);   
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

        passport.authenticate('local-signup',  (err, user, info) => {

            if (err) { return next(err); }

                if (!user){
                temp.message = info;
                temp.status = 409;
                temp.data = null;

                return res.status(temp.status).json(temp);
            }

            req.logIn(user, { session: false }, function(err) {

                if (err) { return next(err); }

                var permalink_local = req.body.username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim();

                var token = randomstring.generate({
                    length: 64
                });

                var link_data = {
                    id : user.id,
                    verify_token : token,
                    permalink : permalink_local,
                    emailverified : false
                }
                console.log(permalink_local +token);

                var link = "http://localhost:8080/verification/" + permalink_local + "/" + token + "/" + user.id;

                var Verification = models.verification;
                temp.status = 200;

                Verification.create(link_data).then(function(client) {

                    if (!client) {
                        console.log("error");
                        temp.message = 'error with verification process';
                        temp.data = null;

                        return res.status(temp.status).json(temp);
                    }

                    //console.log("added to verification");
                    temp.message = 'Successful Signup and link generated';
                    temp.data = user;
                    console.log(temp.message);
                });

                console.log("this message is " + temp.message);
                var mailOptions = {
                    to: user.email,
                    subject: 'Verification link',
                    user: {
                        login_link: link
                    }
                }

                app.mailer.send('email', mailOptions, function (err, message) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log("mail sent");
                });

                console.log(req.session);

                return res.status(temp.status).json(temp);  
            });
        })(req, res, next); 
    });


    app.get('/verification/:link/:token/:id', (req, res) => {

        var Verification = models.verification;

        Verification.update({emailverified : true}, {where :{id : req.params.id, $and:[
            {permalink : req.params.link}, 
            {verify_token : req.params.token},
            {emailverified : false}
            ]}}).then(function(client) {

            if(!client) {
                temp.status = 500;
                temp.message = 'verification unsuccessfull';
                temp.data = null;

                return res.status(temp.status)
                    .json(temp);
            }

            temp.status = 200;
            temp.message = 'The email for client' + req.params.id + 'is verified.';
            temp.data = client;
        });
        res.status(temp.status)
            .json(temp);

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
        console.log(user.id);
    });

    //Route to get all the Main Categories
    app.get('/main_categories', (req, res) => {
        var MainCategory = models.main_category;

        console.log(req.user);

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
    app.get('/sub_categories/:id', function(req, res) {
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

    app.post('/tender/:id', function(req, res) {

        var Tender = models.tender;

        if (req.params.id && req.body.duration && req.body.quantity && req.body.subCategoryId && req.user.id == req.params.id) {

            var tenderData = {
                tenderEnds: req.body.duration,
                quantity: req.body.quantity,
                clientId: req.params.id,
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
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    app.get('/client_tenders/:id', function(req, res) {

        var Tender = models.tender;

        if (req.params.id && req.params.id == req.user.id) {

            Tender.findAll({where: {clientId: req.params.id}}).then(function(clientTenders) {

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
    });

    app.get('/tenders_main_category', function(req, res) {

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
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
