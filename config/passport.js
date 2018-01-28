// config/passport.js

// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const dbconfig = require('./database');
const connection = mysql.createConnection(dbconfig.connection);

connection.query(`USE ${dbconfig.database}`);
// expose this function to our app using module.exports
module.exports = (passport) => {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(({ client_id }, done) => {
        done(null, client_id);
    });

    // used to deserialize the user
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM client WHERE client_id = ? ', [id], (err, rows) => {
            done(err, rows[0]);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
        }, (req, username, password, done) => {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query('SELECT * FROM client WHERE client_email = ?', [username], (err, { length }) => {
                if (err) return done(err);
                if (length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    const newUserMysql = {
                        username,
                        password: bcrypt.hashSync(password, null, null), // use the generateHash function in our user model
                    };

                    const crypto = require('crypto');
                    const random_id = crypto.randomBytes(16).toString('hex');

                    console.log(random_id);

                    const insertQuery = 'INSERT INTO client ( client_id, client_email, client_password ) values (?,?,?)';
                    connection.query(insertQuery, [random_id, newUserMysql.username, newUserMysql.password], function(err, result) {

                        if (err) return done(err);

                        newUserMysql.client_id = random_id;
                        console.log(random_id);
                        return done(null, newUserMysql); 
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true, // allows us to pass back the entire request to the callback
        }, (req, username, password, done) => { // callback with email and password from our form
            connection.query('SELECT * FROM client WHERE client_email = ?', [username], (err, rows) => {
                if (err) return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].client_password)) return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
