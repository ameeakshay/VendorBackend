// app/routes.js
module.exports = (app, passport) => {

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
