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

    //serialize
    passport.serializeUser(function(user, done) {

        Client.findById(user.client_id).then(function(client) {

            if(client) {
                done(null, client.client_id);
            }
            else {
                Vendor.findById(user.vendor_id).then(function(vendor) {
                    if (vendor) {
                        done(null, vendor.vendor_id);
                    }
                    else {
                        done(vendor.errors, null);
                    }
                })
            }
        });
    });

    // deserialize user 
    passport.deserializeUser(function(id, done) {
     
        // Client.findById(id).then(function(user) {
     
        //     if (user) {
     
        //         done(null, user.get());
     
        //     } else {
     
        //         done(user.errors, null);
     
        //     }
     
        // });

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
                        done(vendor.errors, null);
                    }
                })
            }
        });
     
    });

    passport.use('local-signup-client', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {

            Client.findOne({
                where: {
                    client_email: username
                }
            }).then(function(client) {

                if (client)
                {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {

                    var userPassword = generateHash(password);
                    const random_id = crypto.randomBytes(16).toString('hex');
                    console.log(random_id);

                    var data = {
                        client_id: random_id, 
                        client_email: username,
                        client_password: userPassword
                    };

                    Client.create(data).then(function(newUser, created) {
                        
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

    passport.use('local-signup-vendor', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {

            Vendor.findOne({
                where: {
                    vendor_email: username
                }
            }).then(function(vendor) {

                if (vendor)
                {
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {

                    var userPassword = generateHash(password);
                    const random_id = crypto.randomBytes(16).toString('hex');
                    console.log(random_id);

                    var data = {
                        vendor_id: random_id, 
                        vendor_email: username,
                        vendor_password: userPassword
                    };

                    Vendor.create(data).then(function(newUser, created) {
                        
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

            var Client = model.client;

            var isValidPassword = function(userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }

            Client.findOne({
                where: {
                    client_email: username
                }
            }).then(function(client) {

                if (!client) {
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }

                if (!isValidPassword(client.client_password, password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }

                var userinfo = client.get();
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