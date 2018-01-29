// config/passport.js

//load bcrypt
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
 
 
module.exports = function(passport, model) {


    var Client = model.client;
    var LocalStrategy = require('passport-local').Strategy;

    //serialize
    passport.serializeUser(function(user, done) {
        done(null, user.client_id);
    });

    // deserialize user 
    passport.deserializeUser(function(client_id, done) {

        Client.findById(client_id).then(function(client) {
            if (client) {
                done(null, client.get());
            } else {
                done(client.errors, null);
            }
        });
     
    });

    passport.use('local-signup', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function(req, username, password, done) {

            var generateHash = function(password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };

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