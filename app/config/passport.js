// config/passport.js

//load bcrypt
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
 
 
module.exports = function(passport, model) {


    var Client = model.client;
    var Vendor = model.vendor;

    var LocalStrategy = require('passport-local').Strategy;


    var generateHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    var isValidPassword = function(userpass, password) {
        return bCrypt.compareSync(password, userpass);
    }

    //serialize
    passport.serializeUser(function(user, done) {

        Client.findById(user.id).then(function(client) {

            if(client) {
                done(null, client.id);
            }
            else {
                Vendor.findById(user.id).then(function(vendor) {
                    if (vendor) {
                        done(null, vendor.id);
                    }
                    else {
                        done(vendor.errors(), null);
                    }
                })
            }
        });
    });

    // deserialize user 
    passport.deserializeUser(function(id, done) {

        Client.findById(id).then(function(client) {

            if(client) {
                done(null, client.get());
            }
            else {
                Vendor.findById(id).then(function(vendor) {
                    if (vendor) {
                        done(null, vendor.get());
                    }
                    else {
                        done(vendor.errors(), null);
                    }
                })
            }
        });
     
    });

    passport.use('local-signup', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {

            var User;

            if (req.body.type == 'client') {
                console.log('client');

                User = Client;
            }
            else if (req.body.type == 'vendor'){
                console.log('vendor');
            
                User = Vendor;
            }

            User.findOne({
                where: {
                    email: username
                }
            }).then(function(user) {

                if (user)
                {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {

                    var userPassword = generateHash(password);
                    const random_id = crypto.randomBytes(16).toString('hex');
                    console.log(random_id);

                    var data = {
                        id: random_id, 
                        email: username,
                        password: userPassword
                    };

                    User.create(data).then(function(newUser, created) {
                        
                        if (!newUser) {
                            return done(null, false);
                        }

                        if (newUser) {

                            return done(null, newUser);
                        }
                    });
                }
            });
        }
    ));

    //LOCAL LOGIN
    passport.use('local-login', new LocalStrategy( 
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {

            var user;

            if (req.body.type == 'client') {
                console.log('client');

                User = Client;
            }
            else if (req.body.type == 'vendor'){
                console.log('vendor');
            
                User = Vendor;
            }

            User.findOne({
                where: {
                    email: username
                }
            }).then(function(user) {

                if (!user) {
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }

                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }

                // if (!user.emailVerfied) {
                //     return done(null, false, {
                //         message: 'Email not verified!!'
                //     });
                // }
                var userinfo = user.get();
                return done(null, userinfo);

            }).catch(function(err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });
        }
    ));

}