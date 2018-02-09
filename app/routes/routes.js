// app/routes.js

module.exports = (app, passport, models) => {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    var temp = {
        'status' : '',
        'message' : '',
        'data' : ''
    };

    app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

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
                temp.status = '401';
                temp.data = null;

                return res.status(temp.status).json(temp);
            }

            req.logIn(user, function(err) {

            if (err) { return next(err); }

                temp.message = 'Request Successfull';
                temp.status = '200';
                temp.data = user;

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

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/signup', // redirect back to the signup page if there is an error
        failureFlash: true, // allow flash messages
    }));
    
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
    app.get('/main-categories', (req, res) => {
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

    //Route to get all the Sub Categories associated with a Main Category
    app.get('/sub-categories/:id', function(req, res) {
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

    app.post('/tender', function(req, res) {

        var Tender = models.tender;

        if (req.user.id && req.body.duration && req.body.quantity && req.body.subCategoryId) {

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


    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
